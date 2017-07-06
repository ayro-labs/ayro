'use strict';

let User = require('../models').User,
    ChatMessage = require('../models').ChatMessage,
    constants = require('../utils/constants'),
    errors = require('../utils/errors'),
    userCommons = require('./commons/user'),
    slack = require('./integrations/slack'),
    push = require('./integrations/push'),
    Promise = require('bluebird'),
    _ = require('lodash');

const EVENT_CHAT_MESSAGE = 'chat_message';

exports.listMessages = function(device) {
  return ChatMessage.find({device: device.id}).sort({date: 'desc'}).exec().then(function(chatMessages) {
    return _.reverse(chatMessages);
  });
};

exports.postMessage = function(user, device, message) {
  return Promise.all([
    userCommons.getUser(user.id, {populate: 'app latest_device'}),
    userCommons.getDevice(device.id)
  ]).bind({}).spread(function(user, device) {
    if (String(user.id) !== String(device.user)) {
      throw errors.chatzError('device.unknown', 'Unknown device');
    }
    this.device = device;
    if (!user.latest_device || user.latest_device.id !== device.id) {
      return userCommons.updateUser(user, {latest_device: device.id});
    } else {
      return user;
    }
  }).then(function(user) {
    this.user = user;
    let chatMessage = new ChatMessage({
      device: this.device.id,
      text: message.text,
      direction: constants.chatMessage.directions.OUTGOING,
      date: new Date()
    });
    return chatMessage.save();
  }).then(function(chatMessage) {
    let context = this;
    let integrations = this.user.app.listIntegrationsOfChannel(constants.integration.channels.BUSINESS);
    integrations.forEach(function(integration) {
      switch (integration.type) {
        case constants.integration.types.SLACK:
          return slack.postMessage(context.user, context.device, integration.configuration, chatMessage.text);
      }
    });
  });
};

let getIntegrationService = function(channel) {
  switch (channel) {
    case constants.integration.types.SLACK:
      return slack;
    default:
      return null;
  }
};

let pushMessageToUser = function(service, integration, user, data) {
  return Promise.all([service.extractAuthor(data, integration), service.extractText(data)]).bind({}).spread(function(author, text) {
    let chatMessage = new ChatMessage({
      device: user.latest_device.id,
      author: author,
      text: text,
      direction: constants.chatMessage.directions.INCOMING,
      date: new Date()
    });
    return chatMessage.save();
  }).then(function(chatMessage) {
    this.chatMessage = chatMessage;
    return push.message(user, EVENT_CHAT_MESSAGE, chatMessage);
  }).then(function() {
    return service.confirmMessage(data, integration, this.chatMessage);
  });
};

exports.pushMessage = function(channel, data) {
  return Promise.resolve().then(function() {
    let service = getIntegrationService(channel);
    if (!service) {
      return;
    }
    return service.extractUser(data).then(function(user) {
      return user.populate('app latest_device').execPopulate();
    }).then(function(user) {
      let integration = user.app.getIntegration(channel);
      if (integration) {
        return pushMessageToUser(service, integration, user, data);
      }
    });
  });
};