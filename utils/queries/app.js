'use strict';

const {App} = require('models');
const errors = require('utils/errors');
const queryCommon = require('utils/queries/common');

function throwAppNotFoundIfNeeded(app, options) {
  if (!app && (!options || options.require)) {
    throw errors.notFoundError('app_not_found', 'App not found');
  }
}

exports.getApp = async (id, options) => {
  const promise = App.findById(id);
  queryCommon.fillQuery(promise, options);
  const app = await promise.exec();
  throwAppNotFoundIfNeeded(app, options);
  return app;
};

exports.findApp = async (query, options) => {
  const promise = App.findOne(query);
  queryCommon.fillQuery(promise, options);
  const app = await promise.exec();
  throwAppNotFoundIfNeeded(app, options);
  return app;
};

exports.findApps = async (query, options) => {
  const promise = App.find(query);
  queryCommon.fillQuery(promise, options);
  return promise.exec();
};
