const {App} = require('../../../models');
const constants = require('../../../utils/constants');
const integrationCommons = require('../../commons/integration');
const webPush = require('./web');
const androidPush = require('./android');
const messengerPush = require('./messenger');

function getUserChannel(device) {
  switch (device.platform) {
    case constants.device.platforms.WEB.id:
      return constants.integration.channels.WEBSITE;
    case constants.device.platforms.ANDROID.id:
      return constants.integration.channels.ANDROID;
    case constants.device.platforms.MESSENGER.id:
      return constants.integration.channels.MESSENGER;
    default:
      return null;
  }
}

exports.message = (user, event, message) => {
  return integrationCommons.getIntegration(new App({id: user.app}), getUserChannel(user.latest_device)).then((integration) => {
    const device = user.latest_device;
    switch (device.platform) {
      case constants.device.platforms.WEB.id:
        return webPush.push(integration.configuration, user, device, event, message);
      case constants.device.platforms.ANDROID.id:
        return androidPush.push(integration.configuration, user, device, event, message);
      case constants.device.platforms.MESSENGER.id:
        return messengerPush.push(integration.configuration, user, device, event, message);
      default:
        return null;
    }
  });
};
