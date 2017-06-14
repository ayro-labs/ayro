'use strict';

let Integration = require('../models').Integration,
    Promise     = require('bluebird');

const INTEGRATION_ANDROID = 'android';

exports.addAndroidIntegration = function(account, project, configuration) {
  return Promise.resolve().then(function() {
  	let integration = new Integration({
      project: project._id,
      type: INTEGRATION_ANDROID,
      registration_date: new Date(),
      configuration: {
        fcm: {
          server_key: configuration.fcm.server_key,
          sender_id: configuration.fcm.sender_id
        }
      }
  	});
    return integration.save();
  });
};