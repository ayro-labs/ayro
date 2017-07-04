'use strict';

let constants = require('../../../utils/constants'),
    restify = require('restify');

let notifierClient = restify.createJsonClient('http://' + settings.notifier.host + ':' + settings.notifier.port);

exports.push = function(user, device, event, message) {
  return new Promise(function(resolve, reject) {
    let integration = user.app.getIntegration(constants.integration.types.WEB)
    if (!integration || !device.isWeb()) {
      resolve();
      return;
    }
    let data = {
      event: event,
      message: JSON.stringify(message)
    }
    notifierClient.post(options, data, function(err, obj) {
      if (err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
};