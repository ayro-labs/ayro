'use strict';

const {Plugin} = require('models');
const errors = require('utils/errors');
const queriesCommon = require('database/queries/common');

function throwPluginNotFoundIfNeeded(plugin, options) {
  if (!plugin && (!options || options.require)) {
    throw errors.notFoundError('plugin_not_found', 'Plugin not found');
  }
}

exports.getPlugin = async (app, type, options) => {
  return this.findPlugin({app: app.id, type}, options);
};

exports.findPlugin = async (query, options) => {
  const promise = Plugin.findOne(query);
  queriesCommon.fillQuery(promise, options);
  const plugin = await promise.exec();
  throwPluginNotFoundIfNeeded(plugin, options);
  return plugin;
};

exports.findPlugins = async (app, type, options) => {
  const promise = Plugin.find(type ? {app: app.id, type} : {app: app.id});
  queriesCommon.fillQuery(promise, options);
  return promise.exec();
};
