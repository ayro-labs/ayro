'use strict';

let ChatMessage = require('../models').ChatMessage,
    constants = require('../utils/constants'),
    errors = require('../utils/errors'),
    userCommons = require('./commons/user'),
    slackIntegration = require('./integrations/slack'),
    Promise = require('bluebird');

exports.listMessages = function(user) {
  return ChatMessage.find({user: user._id}).sort({date: 'desc'}).exec();
};

exports.postMessage = function(user, device, message) {
  return Promise.all([
    userCommons.getUser(user._id, {populate: 'app latest_device'}),
    userCommons.getDevice(device._id)
  ]).bind({}).spread(function(user, device) {
    if (String(user._id) !== String(device.user)) {
      throw errors.chatzError('device.unknown', 'Unknown device');
    }
    this.device = device;
    if (!user.latest_device || String(user.latest_device._id) !== String(device._id)) {
      return userCommons.updateUser(user, {latest_device: device._id});
    } else {
      return user;
    }
  }).then(function(user) {
    this.user = user;
    let chatMessage = new ChatMessage({
      user: this.user._id,
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
          return slackIntegration.postMessage(context.user, context.device, integration.configuration, chatMessage.text);
      }
    });
  });
};

exports.pushMessage = function(channel, data) {
  return Promise.resolve().then(function() {
    switch (channel) {
      case constants.integration.types.SLACK:
        return slackIntegration.pushMessage(data);
    }
  });
};