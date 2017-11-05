const settings = require('../../../configs/settings');
const restify = require('restify-clients');
const Promise = require('bluebird');

const URL_PROTOCOL = settings.env === 'production' ? 'https' : 'http';
const URL = `${URL_PROTOCOL}://${settings.webcm.host}:${settings.webcm.port}`;

const webcmClient = restify.createJsonClient(URL);

exports.push = (configuration, user, device, event, message) => {
  return new Promise((resolve, reject) => {
    webcmClient.post(`/push/${user.id}`, {event, message}, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
};
