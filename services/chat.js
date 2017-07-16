const ChatMessage = require('../models').ChatMessage;
const constants = require('../utils/constants');
const errors = require('../utils/errors');
const userCommons = require('./commons/user');
const slack = require('./integrations/slack');
const push = require('./integrations/push');
const Promise = require('bluebird');
const _ = require('lodash');

const EVENT_CHAT_MESSAGE = 'chat_message';

exports.listMessages = (device) => {
  return ChatMessage.find({device: device.id}).sort({date: 'desc'}).exec().then((chatMessages) => {
    return _.reverse(chatMessages);
  });
};

exports.postMessage = (user, device, message) => {
  return Promise.all([
    userCommons.getUser(user.id, {populate: 'app latest_device'}),
    userCommons.getDevice(device.id),
  ]).bind({}).spread((user, device) => {
    if (String(user.id) !== String(device.user)) {
      throw errors.chatzError('device.unknown', 'Unknown device');
    }
    this.device = device;
    if (!user.latest_device || user.latest_device.id !== device.id) {
      return userCommons.updateUser(user, {latest_device: device.id});
    }
    return user;
  }).then((user) => {
    this.user = user;
    this.chatMessage = new ChatMessage({
      device: this.device.id,
      text: message.text,
      direction: constants.chatMessage.directions.OUTGOING,
      date: new Date(),
    });
    return this.chatMessage.save();
  }).then((chatMessage) => {
    const context = this;
    const integrations = this.user.app.listIntegrationsOfChannel(constants.integration.channels.BUSINESS);
    integrations.forEach((integration) => {
      switch (integration.type) {
        case constants.integration.types.SLACK:
          return slack.postMessage(context.user, context.device, integration.configuration, chatMessage.text);
        default:
          return null;
      }
    });
  }).then(() => {
    return this.chatMessage;
  });
};

const getIntegrationService = (channel) => {
  switch (channel) {
    case constants.integration.types.SLACK:
      return slack;
    default:
      return null;
  }
};

const pushMessageToUser = (service, integration, user, data) => {
  return Promise.all([service.extractAuthor(data, integration), service.extractText(data)]).bind({}).spread((author, text) => {
    const chatMessage = new ChatMessage({
      device: user.latest_device.id,
      author,
      text,
      direction: constants.chatMessage.directions.INCOMING,
      date: new Date(),
    });
    return chatMessage.save();
  }).then((chatMessage) => {
    this.chatMessage = chatMessage;
    return push.message(user, EVENT_CHAT_MESSAGE, chatMessage);
  }).then(() => {
    return service.confirmMessage(data, integration, user, this.chatMessage);
  });
};

exports.pushMessage = (channel, data) => {
  return Promise.resolve().then(() => {
    const service = getIntegrationService(channel);
    if (!service) {
      return null;
    }
    return service.extractUser(data).then((user) => {
      return user.populate('app latest_device').execPopulate();
    }).then((user) => {
      const integration = user.app.getIntegration(channel);
      if (integration) {
        return pushMessageToUser(service, integration, user, data);
      }
      return null;
    });
  });
};
