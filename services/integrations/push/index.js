const constants = require('../../../utils/constants');
const webPush = require('./web');
const androidPush = require('./android');
const iosPush = require('./ios');

exports.message = (user, event, message) => {
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
      case constants.device.platforms.IOS.id:
        promise = iosPush.push;
        break;
      default:
        // Do nothing
        break;
    }
    if (promise) {
      return promise(user, event, message);
    }
    return null;
  });
};
