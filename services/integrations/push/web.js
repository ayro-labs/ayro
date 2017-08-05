const settings = require('../../../configs/settings');
const constants = require('../../../utils/constants');
const restify = require('restify');

const webcmClient = restify.createJsonClient(`http://${settings.webcm.host}:${settings.webcm.port}`);

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
