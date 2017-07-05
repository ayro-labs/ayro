'use strict';

let constants = require('../../../utils/constants'),
    webPush = require('./web'),
    androidPush = require('./android'),
    iosPush = require('./ios');

exports.message = function(user, event, message) {
  return Promise.resolve().then(function() {
    let device = user.latest_device;
    switch (device.platform) {
      case constants.device.platforms.WEB:
        return webPush.push(user, event, message);
      case constants.device.platforms.ANDROID:
        return androidPush.push(user, event, message);
      case constants.device.platforms.IOS:
        return iosPush.push(user, event, message);
    }
  });
};