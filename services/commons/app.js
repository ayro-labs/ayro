const App = require('../../models').App;
const errors = require('../../utils/errors');
const Promise = require('bluebird');
const _ = require('lodash');

function fillQuery(promise, options) {
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
}

function throwAppNotFoundIfNeeded(app, options) {
  if (!app && (!options || options.require === true)) {
    throw errors.notFoundError('app.doesNotExist', 'App does not exist');
  }
}

exports.getApp = (id, options) => {
  return Promise.resolve().then(() => {
    const promise = App.findById(id);
    fillQuery(promise, options);
    return promise.exec();
  }).then((app) => {
    throwAppNotFoundIfNeeded(app, options);
    return app;
  });
};
