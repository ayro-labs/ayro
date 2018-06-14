'use strict';

const constants = require('utils/constants');
const errors = require('utils/errors');
const files = require('utils/files');
const integrationQueries = require('database/queries/integration');
const userQueries = require('database/queries/user');
const chatCommons = require('services/commons/chat');
const slackChat = require('services/chat/slack');
const {App, ChatMessage} = require('models');
const Promise = require('bluebird');
const _ = require('lodash');

const MAX_FILE_SIZE = 5 * 1000 * 1000;

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
  await loadedUser.update(updatedData, {runValidators: true});
  loadedUser.set(updatedData);
  await loadedUser.populate('app devices').execPopulate();
  const integrations = await integrationQueries.findIntegrations(loadedUser.app, constants.integration.types.BUSINESS);
  const chatMessage = new ChatMessage(message);
  chatMessage.set({
    channel,
    app: loadedUser.app.id,
    user: loadedUser.id,
    direction: constants.chatMessage.directions.OUTGOING,
    date: new Date(),
  });
  const promises = [];
  _.each(integrations, (integration) => {
    const businessChat = getBusinessChat(integration.channel);
    if (businessChat) {
      let promise = null;
      switch (chatMessage.type) {
        case constants.chatMessage.types.TEXT:
          promise = businessChat.postMessage(integration.configuration, loadedUser, chatMessage);
          break;
        case constants.chatMessage.types.FILE:
          promise = businessChat.postFile(integration.configuration, loadedUser, chatMessage);
          break;
        default:
          // Nothing to do...
          break;
      }
      if (promise) {
        promises.push(promise);
      }
    }
  });
  await Promise.all(promises);
  return chatMessage.save();
};

exports.postFile = async (user, channel, file) => {
  if (file.size > MAX_FILE_SIZE) {
    throw errors.ayroError('file_size_limit_exceeded', 'File size limit exceeded');
  }
  const fileUrl = await files.uploadUserFile(user, file);
  return this.postMessage(user, channel, {
    type: constants.chatMessage.types.FILE,
    media: {
      name: file.name,
      type: file.mimeType,
      size: file.size,
      url: fileUrl,
    },
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
    await user.populate('app devices');
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
