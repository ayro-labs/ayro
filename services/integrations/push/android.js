'use strict';

const axios = require('axios');
const ms = require('ms');

const ORIGIN_AYRO = 'ayro';
const TIME_TO_LIVE = Math.floor(ms('10 minutes') / 1000);

const fcmClient = axios.create({
  baseURL: 'https://fcm.googleapis.com/fcm/send',
});

exports.push = async (configuration, user, device, event, message) => {
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
    data: {event, message, origin: ORIGIN_AYRO},
  };
  await fcmClient.post('', data, options);
};
