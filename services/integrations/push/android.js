const restify = require('restify-clients');
const Promise = require('bluebird');

const ORIGIN_CHATZ = 'chatz';
const TIME_TO_LIVE = 600;

const fcmClient = restify.createJsonClient('https://fcm.googleapis.com/fcm/send');

exports.push = (configuration, user, device, event, message) => {
  return new Promise((resolve, reject) => {
    if (!device.push_token || !configuration.fcm || !configuration.fcm.server_key) {
      resolve(null);
      return;
    }
    const options = {
      headers: {
        Authorization: `key=${configuration.fcm.server_key}`,
      },
    };
    const data = {
      registration_ids: [device.push_token],
      time_to_live: TIME_TO_LIVE,
      data: {origin: ORIGIN_CHATZ, event, message},
    };
    fcmClient.post(options, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
};
