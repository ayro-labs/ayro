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

exports.listMessages = async (user, device) => {
  const chatMessages = await ChatMessage.find({user: user.id, device: device.id}).sort({date: 'desc'}).exec();
  return _.reverse(chatMessages);
};

exports.pushMessage = async (channel, data) => {
  const channelApi = getBusinessChannelApi(channel);
  if (!channelApi) {
    throw errors.ayroError('channel.notSupported', 'Channel not supported');
  }
  const integration = await channelApi.getIntegration(data);
  try {
    const user = await channelApi.getUser(data);
    await User.populate(user, 'latest_device');
    const [agent, text] = await Promise.all([
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
    await push.message(user, EVENT_CHAT_MESSAGE, chatMessage);
    await chatMessage.save();
    await channelApi.confirmMessage(integration.configuration, data, user, chatMessage);
  } catch (err) {
    if (err.code === 'user.doesNotExist') {
      await channelApi.postUserNotFound(integration.configuration, data);
    } else {
      await channelApi.postMessageError(integration.configuration, data);
    }
  }
};

exports.postMessage = async (user, device, channel, message) => {
  const [currentUser, currentDevice] = await Promise.all([
    userCommons.getUser(user.id),
    deviceCommons.getDevice(device.id),
  ]);
  if (currentUser.id !== currentDevice.user.toString()) {
    throw errors.ayroError('user.deviceNotOwned', 'This device is not owned by the user');
  }
  const updatedUserData = {};
  let updatedUser = currentUser;
  if (channel !== updatedUser.latest_channel) {
    updatedUserData.latest_channel = channel;
  }
  if (!updatedUser.latest_device || updatedUser.latest_device.toString() !== currentDevice.id) {
    updatedUserData.latest_device = currentDevice.id;
  }
  if (!_.isEmpty(updatedUserData)) {
    updatedUser = await userCommons.updateUser(updatedUser, updatedUserData);
  }
  await User.populate(updatedUser, 'app devices');
  const integrations = await integrationCommons.findIntegrations(updatedUser.app, constants.integration.types.BUSINESS);
  const chatMessage = new ChatMessage({
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
  await Promise.all(promises);
  return chatMessage.save();
};

exports.postProfile = async (channel, data) => {
  const channelApi = getBusinessChannelApi(channel);
  if (!channelApi) {
    throw errors.ayroError('integration.notSupported', 'Integration not supported');
  }
  const integration = await channelApi.getIntegration(data);
  try {
    const user = await channelApi.getUser(data);
    await User.populate(user, 'app devices');
    await channelApi.postProfile(integration.configuration, user);
  } catch (err) {
    if (err.code === 'user.doesNotExist') {
      await channelApi.postUserNotFound(integration.configuration, data);
    } else {
      await channelApi.postProfileError(integration.configuration, data);
    }
  }
};

exports.postHelp = async (channel, data) => {
  const channelApi = getBusinessChannelApi(channel);
  if (!channelApi) {
    throw errors.ayroError('integration.notSupported', 'Integration not supported');
  }
  const integration = await channelApi.getIntegration(data);
  await channelApi.postHelp(integration.configuration, data);
};
