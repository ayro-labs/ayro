const constants = require('../../../utils/constants');
const webPush = require('./web');
const androidPush = require('./android');
const messengerPush = require('./messenger');

exports.message = (integration, user, event, message) => {
  return Promise.resolve().then(() => {
    const device = user.latest_device;
    let promise;
    switch (device.platform) {
      case constants.device.platforms.WEB.id:
        promise = webPush.push;
        break;
      case constants.device.platforms.ANDROID.id:
        promise = androidPush.push;
        break;
      case constants.device.platforms.MESSENGER.id:
        promise = messengerPush.push;
        break;
      default:
        // Do nothing
        break;
    }
    if (promise) {
      return promise(integration, user, device, event, message);
    }
    return null;
  });
};
