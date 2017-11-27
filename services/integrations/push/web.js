const settings = require('../../../configs/settings');
const axios = require('axios');
const Promise = require('bluebird');

const webcmClient = axios.create({
  baseURL: settings.webcmUrl,
});

exports.push = (configuration, user, device, event, message) => {
  return Promise.coroutine(function* () {
    yield webcmClient.post(`/push/${user.id}`, {event, message});
  })();
};
