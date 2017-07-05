'use strict';

let settings = require('../../../configs/settings'),
    constants = require('../../../utils/constants'),
    restify = require('restify');

let notifierClient = restify.createJsonClient('http://' + settings.notifier.host + ':' + settings.notifier.port);

exports.push = function(user, event, message) {
  return new Promise(function(resolve, reject) {
    let device = user.latest_device;
    let integration = user.app.getIntegration(constants.integration.types.WEBSITE);
    if (!integration || !device.isWeb()) {
      resolve();
      return;
    }
    let data = {
      event: event,
      message: message
    };
    notifierClient.post(`/users/${user.id}`, data, function(err, obj) {
      if (err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};