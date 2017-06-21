'use strict';

let User = require('../models').User,
    constants = require('../utils/constants'),
    androidIntegration = require('./integrations/android'),
    iosIntegration = require('./integrations/ios'),
    slackIntegration = require('./integrations/slack');

const EVENT_CHAT_MESSAGE = 'chat_message';

exports.postMessage = function(user, message) {
  return User.findById(user._id).populate('project').exec().then(function(user) {
    if (user) {
      user.project.listIntegrationsOfChannel('business').forEach(function(integration) {
        switch (integration.type) {
          case constants.integrationTypes.SLACK:
            break;
        }
      });
    }
  });
};

exports.pushMessage = function(user, message) {
  return User.findById(user._id).populate('project devices').exec().then(function(user) {
    if (user) {
      user.project.listIntegrationsOfChannel('user').forEach(function(integration) {
        switch (integration.type) {
          case constants.integrationTypes.ANDROID:
            let androidDevice = user.getDevice(constants.devicePlatforms.ANDROID);
            if (androidDevice) {
              androidIntegration.push(integration, androidDevice, EVENT_CHAT_MESSAGE, message);
            }
            break;
          case constants.integrationTypes.IOS:
            let iosDevice = user.getDevice(constants.devicePlatforms.IOS);
            if (iosDevice) {
              iosIntegration.push(integration, androidDevice, EVENT_CHAT_MESSAGE, message);
            }
            break;
        }
      });
    }
  });
};