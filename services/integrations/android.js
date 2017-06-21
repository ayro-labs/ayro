'use strict';

let integrations = require('.'),
    constants = require('../../utils/constants'),
    restify = require('restify'),
    _ = require('lodash');

const CONFIG_ANDROID = ['fcm.server_key', 'fcm.sender_id'];
const ORIGIN_CHATZ = 'chatz';

let fcmClient = restify.createJsonClient('https://fcm.googleapis.com/fcm/send');

exports.add = function(project, configuration) {
  return integrations.add(project, constants.integrationTypes.ANDROID, constants.channels.USER, _.pick(configuration, CONFIG_ANDROID));
};

exports.update = function(project, configuration)   {
  return integrations.update(project, constants.integrationTypes.ANDROID, _.pick(configuration, CONFIG_ANDROID));
};

exports.remove = function(project)   {
  return integrations.remove(project, constants.integrationTypes.ANDROID);
};

exports.push = function(integration, device, event, message) {
  return new Promise(function(resolve, reject) {
    if (integration.type !== constants.integrationTypes.ANDROID || !device.push_token) {
      resolve();
      return;
    }
    if (!integration.configuration.fcm || !integration.configuration.fcm.server_key) {
      resolve();
      return;
    }
    let options = {
      headers: {
        'Authorization': 'key=' + integration.configuration.fcm.server_key
      }
    };
    let data = {
      'registration_ids': [device.push_token],
      'time_to_live': 600,
      'data': {
        'origin': ORIGIN_CHATZ,
        'event': event,
        'message': JSON.stringify(message)
       }
    };
    fcmClient.post(options, data, function(err, obj) {
      if (err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};