'use strict';

let userCommons = require('./commons/user'),
    slackIntegration = require('./integrations/slack'),
    constants = require('../utils/constants');

exports.postMessage = function(user, platform, message) {
  return userCommons.getUser(user._id, {populate: 'app devices'}).then(function(user) {
    let integrations = user.app.listIntegrationsOfChannel(constants.integration.channels.BUSINESS);
    integrations.forEach(function(integration) {
      switch (integration.type) {
        case constants.integration.types.SLACK:
          return slackIntegration.postMessage(user, integration.configuration, platform, message.text);
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