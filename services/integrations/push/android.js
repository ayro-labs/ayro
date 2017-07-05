'use strict';

let constants = require('../../../utils/constants'),
    restify = require('restify');

const ORIGIN_CHATZ = 'chatz';

let fcmClient = restify.createJsonClient('https://fcm.googleapis.com/fcm/send');

exports.push = function(user, event, message) {
  return new Promise(function(resolve, reject) {
    let device = user.latest_device;
    let integration = user.app.getIntegration(constants.integration.types.ANDROID);
    if (!integration || !device.isAndroid() || !device.push_token) {
      resolve();
      return;
    }
    let configuration = integration.configuration
    if (!configuration || !configuration.fcm || !configuration.fcm.server_key) {
      resolve();
      return;
    }
    let options = {
      headers: {
        Authorization: `key=${configuration.fcm.server_key}`
      }
    };
    let data = {
      registration_ids: [device.push_token],
      time_to_live: 600,
      data: {
        origin: ORIGIN_CHATZ,
        event: event,
        message: message
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