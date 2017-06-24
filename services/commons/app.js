'use strict';

let App = require('../../models').App,
    errors = require('../../utils/errors'),
    Promise = require('bluebird');

exports.getApp = function(id, populate) {
  return Promise.resolve().then(function() {
    let promise = App.findById(id);
    if (populate) {
      promise.populate(populate);
    }
    return promise.exec();
  }).then(function(app) {
    if (!app) {
      throw errors.notFoundError('app.doesNotExist', 'App does not exist');
    }
    return app;
  });
};