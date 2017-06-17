'use strict';

let restify = require('restify');

let fcmClient = restify.createJsonClient('https://fcm.googleapis.com/fcm/send');

const PLATFORM_ANDROID = 'android';
const ORIGIN_CHATZ = 'chatz';
const EVENT_CHAT_MESSAGE = 'chat_message';

let toAndroid = function(serverKey, deviceToken, event, message) {
  return new Promise(function(resolve, reject) {
    let options = {
      headers: {
        'Authorization': 'key=' + serverKey
      }
    };
    let data = {
      'registration_ids': [deviceToken],
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

let push = function(user, event, message) {
  return Promise.resolve().then(function() {
    user.project.listIntegrationsOfChannel('user').forEach(function(integration) {
      if (integration.type === PLATFORM_ANDROID) {
        let device = user.getDevice(PLATFORM_ANDROID);
        if (device && device.push_token) {
          let serverKey = integration.configuration.fcm.server_key;
          return toAndroid(serverKey, device.push_token, event, message);
        }
      }
    });
  });
};

exports.chatMessage = function(user, message) {
  return push(user, EVENT_CHAT_MESSAGE, message);
};