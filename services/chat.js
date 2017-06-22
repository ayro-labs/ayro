'use strict';

let userCommons = require('./commons/user'),
    androidIntegration = require('./integrations/android'),
    iosIntegration = require('./integrations/ios'),
    slackIntegration = require('./integrations/slack'),
    constants = require('../utils/constants');

const EVENT_CHAT_MESSAGE = 'chat_message';

exports.postMessage = function(user, message) {
  return userCommons.getUser(user._id, 'project').then(function(user) {
    user.project.listIntegrationsOfChannel(constants.channels.BUSINESS).forEach(function(integration) {
      switch (integration.type) {
        case constants.integrationTypes.SLACK:
          return slackIntegration.postMessage(user, message);
      }
    });
  });
};

exports.pushMessage = function(user, message) {
  return userCommons.getUser(user._id, 'project devices').then(function(user) {
    user.project.listIntegrationsOfChannel(constants.channels.USER).forEach(function(integration) {
      switch (integration.type) {
        case constants.integrationTypes.ANDROID:
          let androidDevice = user.getDevice(constants.devicePlatforms.ANDROID);
          if (androidDevice) {
            return androidIntegration.push(integration, androidDevice, EVENT_CHAT_MESSAGE, message);
          }
          break;
        case constants.integrationTypes.IOS:
          let iosDevice = user.getDevice(constants.devicePlatforms.IOS);
          if (iosDevice) {
            return iosIntegration.push(integration, androidDevice, EVENT_CHAT_MESSAGE, message);
          }
          break;
      }
    });
  });
};