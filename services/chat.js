'use strict';

let userCommons = require('./commons/user'),
    androidIntegration = require('./integrations/android'),
    iosIntegration = require('./integrations/ios'),
    slackIntegration = require('./integrations/slack'),
    constants = require('../utils/constants');

const EVENT_CHAT_MESSAGE = 'chat_message';

exports.postMessage = function(user, platform, message) {
  return userCommons.getUser(user._id, 'app devices').then(function(user) {
    user.app.listIntegrationsOfChannel(constants.integration.channels.BUSINESS).forEach(function(integration) {
      switch (integration.type) {
        case constants.integration.types.SLACK:
          return slackIntegration.postMessage(user, platform, message.text);
      }
    });
  });
};

exports.pushMessage = function(user, message) {
  return userCommons.getUser(user._id, 'app devices').then(function(user) {
    user.app.listIntegrationsOfChannel(constants.integration.channels.USER).forEach(function(integration) {
      switch (integration.type) {
        case constants.integration.types.ANDROID:
          let androidDevice = user.getDevice(constants.device.platforms.ANDROID);
          if (androidDevice) {
            return androidIntegration.push(integration, androidDevice, EVENT_CHAT_MESSAGE, message);
          }
          break;
        case constants.integration.types.IOS:
          let iosDevice = user.getDevice(constants.device.platforms.IOS);
          if (iosDevice) {
            return iosIntegration.push(integration, androidDevice, EVENT_CHAT_MESSAGE, message);
          }
          break;
      }
    });
  });
};