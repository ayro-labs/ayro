'use strict';

const {App, Plugin, Agent} = require('../models');
const settings = require('../configs/settings');
const constants = require('../utils/constants');
const errors = require('../utils/errors');
const appCommons = require('./commons/app');
const pluginCommons = require('./commons/plugin');
const userCommons = require('./commons/user');
const chatCommons = require('./commons/chat');
const pubSub = require('pubsub-js');
const moment = require('moment');
const _ = require('lodash');

const CONFIG_OFFICE_HOURS = ['timezone', 'time_range', 'time_range.sunday', 'time_range.monday', 'time_range.tuesday', 'time_range.wednesday', 'time_range.thursday', 'time_range.friday', 'time_range.saturday', 'reply'];

async function executeOfficeHoursPlugin(plugin, user) {
  const now = moment();
  const lastCheck = _.get(user, 'extra.plugins.office_hours.last_check');
  if (!lastCheck || moment(lastCheck).dayOfYear() !== now.dayOfYear()) {
    const timezone = plugin.configuration.timezone;
    now.utcOffset(timezone)
    const day = _.lowerCase(now.format('dddd'));
    const timeRange = plugin.configuration.time_range[day];
    if (timeRange) {
      const startTime = moment(timeRange.start, 'hh:mm').utcOffset(timezone);
      const endTime = moment(timeRange.end, 'hh:mm').utcOffset(timezone);
      if (!now.isBefore(startTime) && !now.isAfter(endTime)) {
        const app = await appCommons.getApp(user.app);
        const agent = {
          id: '0',
          name: app.name,
          photo_url: `${settings.appIconUrl}/${app.icon}`,
        };
        setTimeout(() => {
          chatCommons.pushMessage(agent, user, plugin.configuration.reply);
        }, 3000);
      }
    }
    await user.update({'extra.plugins.office_hours.last_check': moment().valueOf()})
  }
}

pubSub.subscribe(constants.events.VIEW_CHAT, async (msg, user) => {
  const loadedUser = await userCommons.getUser(user.id);
  if (_.get(loadedUser, 'loadedUser.extra.events.view_chat', 0) === 1) {
    const app = new App({id: loadedUser.app});
    const welcomeMessagePlugin = await pluginCommons.getPlugin(app, constants.plugin.types.WELCOME_MESSAGE, {require: false});
    if (welcomeMessagePlugin) {
      // chatCommons.pushMessage(agent, loadedUser, text);
    }
  }
});

pubSub.subscribe(constants.events.POST_MESSAGE, async (msg, user) => {
  const loadedUser = await userCommons.getUser(user.id);
  const app = new App({id: loadedUser.app});
  const officeHoursPlugin = await pluginCommons.getPlugin(app, constants.plugin.types.OFFICE_HOURS, {require: false});
  if (officeHoursPlugin) {
    executeOfficeHoursPlugin(officeHoursPlugin, loadedUser);
  }
});

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
