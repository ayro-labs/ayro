'use strict';

let integrations = require('.'),
    constants = require('../../utils/constants'),
    restify = require('restify'),
    _ = require('lodash');

const CONFIG_ANDROID = ['fcm.server_key', 'fcm.sender_id'];
const ORIGIN_CHATZ = 'chatz';

let fcmClient = restify.createJsonClient('https://fcm.googleapis.com/fcm/send');

exports.add = function(app, configuration) {
  return integrations.add(app, constants.integration.types.ANDROID, constants.integration.channels.USER, _.pick(configuration, CONFIG_ANDROID));
};

exports.update = function(app, configuration)   {
  return integrations.update(app, constants.integration.types.ANDROID, _.pick(configuration, CONFIG_ANDROID));
};

exports.remove = function(app)   {
  return integrations.remove(app, constants.integration.types.ANDROID);
};

exports.push = function(integration, device, event, message) {
  return new Promise(function(resolve, reject) {
    if (integration.type !== constants.integration.types.ANDROID || !device.push_token) {
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