'use strict';

const {Plugin} = require('../models');
const constants = require('../utils/constants');
const errors = require('../utils/errors');
const pluginCommons = require('./commons/plugin');
const _ = require('lodash');

const CONFIG_OFFICE_HOURS = ['timezone', 'time_range', 'time_range.sunday', 'time_range.monday', 'time_range.tuesday', 'time_range.wednesday', 'time_range.thursday', 'time_range.friday', 'time_range.saturday', 'reply'];

async function addPlugin(app, type, channels, configuration) {
  let plugin = await pluginCommons.getPlugin(app, type, {require: false});
  if (plugin) {
    throw errors.ayroError('plugin_already_exists', 'Plugin already exists');
  }
  plugin = new Plugin({
    type,
    channels,
    configuration,
    app: app.id,
    registration_date: new Date(),
  });
  return plugin.save();
}

async function updatePlugin(app, type, channels, configuration) {
  const plugin = await pluginCommons.getPlugin(app, type);
  await plugin.update({channels, configuration}, {runValidators: true});
  plugin.set({channels, configuration});
  return plugin;
}

exports.getPlugin = async (app, type, options) => {
  return pluginCommons.getPlugin(app, type, options);
};

exports.addOfficeHoursPlugin = async (app, channels, configuration) => {
  return addPlugin(app, constants.plugin.types.OFFICE_HOURS, channels, _.pick(configuration, CONFIG_OFFICE_HOURS));
};

exports.updateOfficeHoursPlugin = async (app, channels, configuration) => {
  return updatePlugin(app, constants.plugin.types.OFFICE_HOURS, channels, configuration);
};

exports.addWelcomeMessagePlugin = async (app, channels, configuration) => {
  return addPlugin(app, constants.plugin.types.WELCOME_MESSAGE, channels, _.pick(configuration, CONFIG_WELCOME_MESSAGE));
};

// exports.updateWelcomeMessagePlugin = async (app, channels, configuration) => {

// };

exports.removePlugin = async (app, type) => {
  const plugin = await pluginCommons.getPlugin(app, type);
  await Plugin.remove({_id: plugin.id});
};
