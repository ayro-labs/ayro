'use strict';

let User = require('../models').User,
    android = require('./internals/android'),
    ios = require('./internals/ios'),
    slack = require('./internals/slack');

const INTEGRATION_ANDROID = 'android';
const INTEGRATION_IOS = 'ios';
const INTEGRATION_SLACK = 'slack';

const PLATFORM_ANDROID = 'android';
const PLATFORM_IOS = 'ios';
const EVENT_CHAT_MESSAGE = 'chat_message';

exports.postMessage = function(user, message) {
  return User.findById(user._id).populate('project').exec().then(function(user) {
    if (user) {
      user.project.listIntegrationsOfChannel('business').forEach(function(integration) {
        switch (integration.type) {
          case INTEGRATION_SLACK:
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
          case INTEGRATION_ANDROID:
            let androidDevice = user.getDevice(PLATFORM_ANDROID);
            if (androidDevice && androidDevice.push_token) {
              let serverKey = integration.configuration.fcm.server_key;
              return android.push(serverKey, androidDevice.push_token, EVENT_CHAT_MESSAGE, message);
            }
            break;
          case INTEGRATION_IOS:
            let iosDevice = user.getDevice(PLATFORM_IOS);
            if (iosDevice && iosDevice.push_token) {
              let serverKey = integration.configuration.fcm.server_key;
              return ios.push(serverKey, iosDevice.push_token, EVENT_CHAT_MESSAGE, message);
            }
            break;
        }
      });
    }
  });
};