const {App, User, ChatMessage} = require('../../models');
const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const logger = require('../../utils/logger');
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

exports.postMessage = (user, device, message) => {
  return Promise.coroutine(function* () {
    const [currentUser, currentDevice] = yield Promise.all([
      userCommons.getUser(user.id),
      deviceCommons.getDevice(device.id),
    ]);
    if (String(currentUser.id) !== String(currentDevice.user)) {
      throw errors.chatzError('device.unknown', 'Unknown device');
    }
    let updatedUser = currentUser;
    if (!updatedUser.latest_device || updatedUser.latest_device.toString() !== currentDevice.id) {
      updatedUser = yield userCommons.updateUser(updatedUser, {latest_device: currentDevice.id});
    }
    updatedUser = yield User.populate(updatedUser, 'app devices');
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

exports.pushMessage = (channel, data) => {
  return Promise.coroutine(function* () {
    const channelApi = getBusinessChannelApi(channel);
    if (!channelApi) {
      throw errors.chatzError('channel.notSupported', 'Channel not supported');
    }
    let user = yield channelApi.extractUser(data);
    user = yield User.populate(user, 'latest_device');
    const businessIntegration = yield integrationCommons.getIntegration(new App({id: user.app}), channel);
    const [agent, text] = yield Promise.all([
      channelApi.extractAgent(businessIntegration.configuration, data),
      channelApi.extractText(data),
    ]);
    let chatMessage = new ChatMessage({
      agent,
      text,
      user: user.id,
      device: user.latest_device.id,
      direction: constants.chatMessage.directions.INCOMING,
      date: new Date(),
    });
    yield push.message(user, EVENT_CHAT_MESSAGE, chatMessage);
    chatMessage = yield chatMessage.save();
    yield channelApi.confirmMessage(businessIntegration.configuration, data, user, chatMessage);
    return null;
  })();
};

exports.postProfile = (channel, data) => {
  return Promise.coroutine(function* () {
    const channelApi = getBusinessChannelApi(channel);
    if (!channelApi) {
      throw errors.chatzError('integration.notSupported', 'Integration not supported');
    }
    let user = yield channelApi.extractUser(data);
    user = yield userCommons.getUser(user.id, {populate: 'app devices'});
    const integration = yield integrationCommons.getIntegration(new App({id: user.app}), channel);
    yield channelApi.postProfile(integration.configuration, user);
    return null;
  })();
};
