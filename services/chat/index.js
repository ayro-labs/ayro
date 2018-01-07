const {User, ChatMessage} = require('../../models');
const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const userCommons = require('../commons/user');
const deviceCommons = require('../commons/device');
const integrationCommons = require('../commons/integration');
const slack = require('../integrations/slack');
const push = require('../integrations/push');
const Promise = require('bluebird');
const _ = require('lodash');

const EVENT_CHAT_MESSAGE = 'chat_message';

function getBusinessChannelApi(channel) {
  switch (channel) {
    case constants.integration.channels.SLACK:
      return slack;
    default:
      return null;
  }
}

exports.listMessages = (user, device) => {
  return Promise.coroutine(function* () {
    const chatMessages = yield ChatMessage.find({user: user.id, device: device.id}).sort({date: 'desc'}).exec();
    return _.reverse(chatMessages);
  })();
};

exports.pushMessage = (channel, data) => {
  return Promise.coroutine(function* () {
    const channelApi = getBusinessChannelApi(channel);
    if (!channelApi) {
      throw errors.ayroError('channel.notSupported', 'Channel not supported');
    }
    const integration = yield channelApi.getIntegration(data);
    try {
      const user = yield channelApi.getUser(data);
      yield User.populate(user, 'latest_device');
      const [agent, text] = yield Promise.all([
        channelApi.getAgent(integration.configuration, data),
        channelApi.extractText(data),
      ]);
      const chatMessage = new ChatMessage({
        agent,
        text,
        user: user.id,
        device: user.latest_device.id,
        direction: constants.chatMessage.directions.INCOMING,
        date: new Date(),
      });
      yield push.message(user, EVENT_CHAT_MESSAGE, chatMessage);
      yield chatMessage.save();
      yield channelApi.confirmMessage(integration.configuration, data, user, chatMessage);
    } catch (err) {
      if (err.code === 'user.doesNotExist') {
        yield channelApi.postUserNotFound(integration.configuration, data);
      } else {
        yield channelApi.postMessageError(integration.configuration, data);
      }
    }
  })();
};

exports.postMessage = (user, device, message) => {
  return Promise.coroutine(function* () {
    const [currentUser, currentDevice] = yield Promise.all([
      userCommons.getUser(user.id),
      deviceCommons.getDevice(device.id),
    ]);
    if (currentUser.id !== currentDevice.user.toString()) {
      throw errors.ayroError('user.deviceNotOwned', 'This device is not owned by the user');
    }
    let updatedUser = currentUser;
    if (!updatedUser.latest_device || updatedUser.latest_device.toString() !== currentDevice.id) {
      updatedUser = yield userCommons.updateUser(updatedUser, {latest_device: currentDevice.id});
    }
    yield User.populate(updatedUser, 'app devices');
    const integrations = yield integrationCommons.findIntegrations(updatedUser.app, constants.integration.types.BUSINESS);
    let chatMessage = new ChatMessage({
      user: updatedUser.id,
      device: currentDevice.id,
      text: message.text,
      direction: constants.chatMessage.directions.OUTGOING,
      date: new Date(),
    });
    const promises = [];
    integrations.forEach((integration) => {
      const channelApi = getBusinessChannelApi(integration.channel);
      if (channelApi) {
        promises.push(channelApi.postMessage(integration.configuration, updatedUser, chatMessage.text));
      }
    });
    yield Promise.all(promises);
    chatMessage = yield chatMessage.save();
    return chatMessage;
  })();
};

exports.postProfile = (channel, data) => {
  return Promise.coroutine(function* () {
    const channelApi = getBusinessChannelApi(channel);
    if (!channelApi) {
      throw errors.ayroError('integration.notSupported', 'Integration not supported');
    }
    const integration = yield channelApi.getIntegration(data);
    try {
      const user = yield channelApi.getUser(data);
      yield User.populate(user, 'app devices');
      yield channelApi.postProfile(integration.configuration, user);
    } catch (err) {
      if (err.code === 'user.doesNotExist') {
        yield channelApi.postUserNotFound(integration.configuration, data);
      } else {
        yield channelApi.postProfileError(integration.configuration, data);
      }
    }
  })();
};

exports.postHelp = (channel, data) => {
  return Promise.coroutine(function* () {
    const channelApi = getBusinessChannelApi(channel);
    if (!channelApi) {
      throw errors.ayroError('integration.notSupported', 'Integration not supported');
    }
    const integration = yield channelApi.getIntegration(data);
    yield channelApi.postHelp(integration.configuration, data);
  })();
};
