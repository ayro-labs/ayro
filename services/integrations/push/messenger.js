const apis = require('../../../utils/apis');
const Promise = require('bluebird');

exports.push = (integration, user, device, event, message) => {
  return Promise.resolve().then(() => {
    const configuration = integration.configuration;
    if (!device.info || !device.info.profile_id || !configuration.page) {
      return null;
    }
    const data = {
      recipient: {
        id: device.info.profile_id,
      },
      message: {
        text: message,
      },
    };
    return apis.facebook(configuration, true).api('me/messages', data);
  });
};
