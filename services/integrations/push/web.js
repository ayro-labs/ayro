const settings = require('../../../configs/settings');
const axios = require('axios');
const Promise = require('bluebird');

const webcmUrlProtocol = settings.env === 'production' ? 'https' : 'http';
const webcmUrl = `${webcmUrlProtocol}://${settings.webcm.host}:${settings.webcm.port}`;

const webcmClient = axios.create({
  baseURL: webcmUrl,
});

exports.push = (configuration, user, device, event, message) => {
  return Promise.coroutine(function* () {
    yield webcmClient.post(`/push/${user.id}`, {event, message});
  })();
};
