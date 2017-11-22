const axios = require('axios');
const Promise = require('bluebird');

const ORIGIN_CHATZ = 'chatz';
const TIME_TO_LIVE = 600;

const fcmClient = axios.create({
  baseURL: 'https://fcm.googleapis.com/fcm/send',
});

exports.push = (configuration, user, device, event, message) => {
  return Promise.coroutine(function* () {
    if (!device.push_token || !configuration.fcm || !configuration.fcm.server_key) {
      return;
    }
    const options = {
      headers: {
        authorization: `key=${configuration.fcm.server_key}`,
      },
    };
    const data = {
      registration_ids: [device.push_token],
      time_to_live: TIME_TO_LIVE,
      data: {event, message, origin: ORIGIN_CHATZ},
    };
    yield fcmClient.post('', data, options);
  })();
};
