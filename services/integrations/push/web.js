const settings = require('../../../configs/settings');
const constants = require('../../../utils/constants');
const restify = require('restify-clients');

const protocol = settings.env === 'production' ? 'https' : 'http';
const url = `${protocol}://${settings.webcm.host}:${settings.webcm.port}`;

const webcmClient = restify.createJsonClient(url);

exports.push = (user, event, message) => {
  return new Promise((resolve, reject) => {
    const device = user.latest_device;
    const integration = user.app.getIntegration(constants.integration.channels.WEBSITE);
    if (!integration || !device.isWeb()) {
      resolve();
      return;
    }
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
