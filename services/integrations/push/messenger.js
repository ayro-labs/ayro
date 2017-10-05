const constants = require('../../../utils/constants');
const apis = require('../../../utils/apis');
const Promise = require('bluebird');

exports.push = (user, event, message) => {
  return Promise.resolve().then(() => {
    const device = user.latest_device;
    const integration = user.app.getIntegration(constants.integration.channels.MESSENGER);
    if (!integration || !device.isMessenger()) {
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
    return apis.facebook(integration.configuration, true).api('me/messages', data);
  });
};
