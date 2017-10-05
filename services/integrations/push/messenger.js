const settings = require('../../../configs/settings');
const constants = require('../../../utils/constants');
const Promise = require('bluebird');
const FB = require('fb');

function getFacebookApi(configuration) {
  return new FB.Facebook({
    appId: settings.facebook.appId,
    appSecret: settings.facebook.appSecret,
    accessToken: configuration.page.access_token,
    version: 'v2.10',
  });
}

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
    return getFacebookApi(integration.configuration).api('me/messages', data);
  });
};
