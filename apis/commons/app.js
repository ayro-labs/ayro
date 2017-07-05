'use strict';

let App = require('../../models').App,
    errors = require('../../utils/errors'),
    Promise = require('bluebird');

let fillQuery = function(promise, options) {
  if (options) {
    if (!_.has(options, 'require')) {
      options.require = true;
    }
    if (options.populate) {
      promise.populate(options.populate);
    }
    if (options.lean) {
      promise.lean();
    }
  }
};

let throwAppNotFoundIfNeeded = function(app, options) {
  if (!app && (!options || options.require === true)) {
    throw errors.notFoundError('app.doesNotExist', 'App does not exist');
  }
};

exports.getApp = function(id, options) {
  return Promise.resolve().then(function() {
    let promise = App.findById(id);
    fillQuery(promise, options);
    return promise.exec();
  }).then(function(app) {
    throwAppNotFoundIfNeeded(app, options);
    return app;
  });
};