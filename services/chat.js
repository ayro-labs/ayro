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

exports.pushMessage = function(channel, message) {
  return Promise.resolve().then(function() {
    switch (channel) {
      case constants.integration.types.SLACK:
        return slackIntegration.pushMessage(message);
        break;
    }
  });
};