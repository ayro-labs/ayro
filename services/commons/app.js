'use strict';

const {App} = require('../../models');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');

function throwAppNotFoundIfNeeded(app, options) {
  if (!app && (!options || options.require)) {
    throw errors.notFoundError('app_not_found', 'App not found');
  }
}

exports.getApp = async (id, options) => {
  const promise = App.findById(id);
  queries.fillQuery(promise, options);
  const app = await promise.exec();
  throwAppNotFoundIfNeeded(app, options);
  return app;
};

exports.findApp = async (query, options) => {
  const promise = App.findOne(query);
  queries.fillQuery(promise, options);
  const app = await promise.exec();
  throwAppNotFoundIfNeeded(app, options);
  return app;
};

exports.findApps = async (query, options) => {
  const promise = App.find(query);
  queries.fillQuery(promise, options);
  return promise.exec();
};
