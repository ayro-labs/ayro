const settings = require('../../../configs/settings');
const restify = require('restify-clients');
const Promise = require('bluebird');

const WEBCM_URL_PROTOCOL = settings.env === 'production' ? 'https' : 'http';
const WEBCM_URL = `${WEBCM_URL_PROTOCOL}://${settings.webcm.host}:${settings.webcm.port}`;

const webcmClient = restify.createJsonClient(WEBCM_URL);

exports.push = (integration, user, device, event, message) => {
  return new Promise((resolve, reject) => {
    const data = {event, message};
    webcmClient.post(`/push/${user.id}`, data, (err, obj) => {
      if (err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};
