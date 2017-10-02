const constants = require('../../../utils/constants');
const restify = require('restify-clients');

const ORIGIN_CHATZ = 'chatz';
const TIME_TO_LIVE = 600;

const fcmClient = restify.createJsonClient('https://fcm.googleapis.com/fcm/send');

exports.push = (user, event, message) => {
  return new Promise((resolve, reject) => {
    const device = user.latest_device;
    const integration = user.app.getIntegration(constants.integration.channels.ANDROID);
    if (!integration || !device.isAndroid() || !device.push_token) {
      resolve();
      return;
    }
    const configuration = integration.configuration;
    if (!configuration || !configuration.fcm || !configuration.fcm.server_key) {
      resolve();
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
    fcmClient.post(options, data, (err, obj) => {
      if (err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};
