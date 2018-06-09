'use strict';

const {App, User, ChatMessage} = require('models');
const constants = require('utils/constants');
const errors = require('utils/errors');
const files = require('utils/files');
const integrationQueries = require('utils/queries/integration');
const userQueries = require('utils/queries/user');
const userCommons = require('services/commons/user');
const chatCommons = require('services/commons/chat');
const slackChat = require('services/chat/slack');
const Promise = require('bluebird');
const _ = require('lodash');

function getBusinessChat(channel) {
  switch (channel) {
    case constants.integration.channels.SLACK:
      return slackChat;
    default:
      return null;
  }
}

exports.listMessages = async (user, channel) => {
  return ChatMessage.find({user: user.id, channel}).sort({date: 'asc'}).exec();
};

exports.pushMessage = async (channel, data) => {
  const businessChat = getBusinessChat(channel);
  if (!businessChat) {
    throw errors.ayroError('channel_not_supported', 'Channel not supported');
  }
  const integration = await businessChat.getIntegration(data);
  const {configuration} = integration;
  try {
    const agent = await businessChat.getAgent(configuration, data);
    const user = await businessChat.getUser(configuration, data);
    const text = await businessChat.getText(configuration, data);
    const chatMessage = await chatCommons.pushMessage(agent, user, text);
    await businessChat.confirmMessage(configuration, data, user, chatMessage);
  } catch (err) {
    if (err.code === 'user_not_found') {
      await businessChat.postUserNotFound(configuration, data);
    } else {
      await businessChat.postMessageError(configuration, data);
    }
  }
};

exports.postMessage = async (user, channel, message) => {
  const loadedUser = await userQueries.getUser(user.id);
  const updatedData = {transient: false};
  if (channel !== loadedUser.latest_channel) {
    updatedData.latest_channel = channel;
  }
  const updatedUser = await userCommons.updateUser(loadedUser, updatedData);
  await User.populate(updatedUser, 'app devices');
  const integrations = await integrationQueries.findIntegrations(updatedUser.app, constants.integration.types.BUSINESS);
  const chatMessage = new ChatMessage(message);
  chatMessage.set({
    channel,
    app: updatedUser.app.id,
    user: updatedUser.id,
    direction: constants.chatMessage.directions.OUTGOING,
    date: new Date(),
  });
  const promises = [];
  _.each(integrations, (integration) => {
    const businessChat = getBusinessChat(integration.channel);
    if (businessChat) {
      promises.push(businessChat.postMessage(integration.configuration, updatedUser, chatMessage));
    }
  });
  await Promise.all(promises);
  return chatMessage.save();
};

exports.postFile = async (user, channel, file) => {
  const url = await files.uploadUserFile(user, {
    path: file.path,
    name: file.originalname,
    mimeType: file.mimetype,
  });
  return this.postMessage(user, channel, {
    type: constants.chatMessage.types.FILE,
    media: {
      url,
      type: file.mimetype,
    },
  });
};

exports.postImage = async (user, channel, image) => {
  const url = await files.uploadUserFile(user, {
    path: file.path,
    name: file.originalname,
    mimeType: file.mimetype,
  });
  return this.postMessage(user, channel, {
    type: constants.chatMessage.types.IMAGE,
    media: {url},
  });
};

exports.postDeviceConnected = async (user, device) => {
  if (device.platform === constants.device.platforms.EMAIL.id) {
    const loadedUser = await userQueries.getUser(user.id);
    const app = new App({id: loadedUser.app});
    const integrations = await integrationQueries.findIntegrations(app, constants.integration.types.BUSINESS);
    const promises = [];
    _.each(integrations, (integration) => {
      const businessChat = getBusinessChat(integration.channel);
      if (businessChat) {
        promises.push(businessChat.postEmailConnected(integration.configuration, loadedUser, device.info.email));
      }
    });
    await Promise.all(promises);
  }
};

exports.postProfile = async (channel, data) => {
  const businessChat = getBusinessChat(channel);
  if (!businessChat) {
    throw errors.ayroError('integration_not_supported', 'Integration not supported');
  }
  const integration = await businessChat.getIntegration(data);
  const {configuration} = integration;
  try {
    const user = await businessChat.getUser(configuration, data);
    await User.populate(user, 'app devices');
    await businessChat.postProfile(configuration, user);
  } catch (err) {
    if (['user_not_found', 'channel_not_found'].includes(err.code)) {
      await businessChat.postUserNotFound(configuration, data);
    } else {
      await businessChat.postProfileError(configuration, data);
    }
  }
};

exports.postHelp = async (channel, data) => {
  const businessChat = getBusinessChat(channel);
  if (!businessChat) {
    throw errors.ayroError('integration_not_supported', 'Integration not supported');
  }
  const integration = await businessChat.getIntegration(data);
  await businessChat.postHelp(integration.configuration, data);
};
