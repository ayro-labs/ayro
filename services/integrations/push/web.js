const settings = require('../../../configs/settings');
const restify = require('restify-clients');
const Promise = require('bluebird');

Promise.promisifyAll(restify.JsonClient.prototype);

const URL_PROTOCOL = settings.env === 'production' ? 'https' : 'http';
const URL = `${URL_PROTOCOL}://${settings.webcm.host}:${settings.webcm.port}`;

const webcmClient = restify.createJsonClient(URL);

exports.push = (configuration, user, device, event, message) => {
  return Promise.coroutine(function* () {
    yield webcmClient.postAsync(`/push/${user.id}`, {event, message});
  })();
};
