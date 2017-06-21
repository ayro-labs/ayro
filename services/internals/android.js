'use strict';

let restify = require('restify');

let fcmClient = restify.createJsonClient('https://fcm.googleapis.com/fcm/send');

const ORIGIN_CHATZ = 'chatz';

exports.push = function(serverKey, deviceToken, event, message) {
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