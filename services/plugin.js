'use strict';

const {Plugin} = require('../models');
const constants = require('../utils/constants');
const errors = require('../utils/errors');
const queries = require('../utils/queries');

function throwPluginNotFoundIfNeeded(plugin, options) {
  if (!plugin && (!options || options.require)) {
    throw errors.notFoundError('plugin_not_found', 'Plugin not found');
  }
}

exports.getPlugin = async (app, type, options) => {
  const promise = Plugin.findOne({app: app.id, type});
  queries.fillQuery(promise, options);
  const plugin = await promise.exec();
  throwPluginNotFoundIfNeeded(plugin, options);
  return plugin;
};

exports.addOfficeHoursPlugin = async (account, app, channels, configuration) => {
  const plugin = new Plugin({
    channels,
    configuration,
    type: constants.plugin.types.OFFICE_HOURS,
    app: app.id,
    registration_date: new Date(),
  });
  return plugin.save();
};

exports.updateOfficeHoursPlugin = async (account, app, channels, configuration) => {

}

exports.addWelcomeMessagePlugin = async (account, app, channels, configuration) => {

};

exports.updateWelcomeMessagePlugin = async (account, app, channels, configuration) => {

}

exports.removePlugin = async (account, app, plugin) => {

};