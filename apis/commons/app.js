'use strict';

let App = require('../../models').App,
    errors = require('../../utils/errors'),
    Promise = require('bluebird');

exports.getApp = function(id, options) {
  return Promise.resolve().then(function() {
    let promise = App.findById(id);
    if (options) {
      if (options.populate) {
        promise.populate(populate);
      }
      if (options.lean) {
        promise.lean();
      }
    }
    return promise.exec();
  }).then(function(app) {
    if (!app) {
      throw errors.notFoundError('app.doesNotExist', 'App does not exist');
    }
    return app;
  });
};