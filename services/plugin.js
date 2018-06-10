'use strict';

const constants = require('utils/constants');
const errors = require('utils/errors');
const pubSub = require('utils/pubSub');
const appQueries = require('database/queries/app');
const pluginQueries = require('database/queries/plugin');
const userQueries = require('database/queries/user');
const chatCommons = require('services/commons/chat');
const {App, Plugin} = require('models');
const {logger} = require('@ayro/commons');
const Promise = require('bluebird');
const moment = require('moment');
const _ = require('lodash');

const CONFIG_OFFICE_HOURS = ['timezone', 'time_range', 'time_range.sunday', 'time_range.monday', 'time_range.tuesday', 'time_range.wednesday', 'time_range.thursday', 'time_range.friday', 'time_range.saturday', 'reply'];
const CONFIG_GREETINGS_MESSAGE = ['message'];

const SEND_MESSAGE_DELAY_SMALL = 2000;
const SEND_MESSAGE_DELAY = 4000;
const REPLY_SOON_MESSAGE = 'Obrigado pelo seu contato! Nosso time irá respondê-lo o mais breve possível.';
const CONNECT_CHANNEL_MESSAGE = 'Para não perder nenhuma mensagem, nos deixe um meio alternativo para contato.';

function getAppAgent(app) {
  return {
    id: '0',
    name: app.name,
    photo_url: app.icon_url,
  };
}

function fixTimezone(timezone) {
  if (timezone === 'UTC') {
    return 'UTC+00:00';
  }
  return timezone;
}

async function sendGreetingsMessageIfNeeded(plugin, user, channel) {
  const app = await appQueries.getApp(user.app);
  const agent = getAppAgent(app);
  await Promise.delay(SEND_MESSAGE_DELAY_SMALL);
  await chatCommons.pushMessage(agent, user, plugin.configuration.message, channel);
}

async function sendOfficeHoursMessageIfNeeded(plugin, user) {
  const now = moment();
  const lastCheck = _.get(user, 'extra.plugins.office_hours.last_check');
  if (lastCheck && moment(lastCheck).dayOfYear() === now.dayOfYear()) {
    return false;
  }
  const timezone = fixTimezone(plugin.configuration.timezone);
  now.utcOffset(timezone);
  const day = _.lowerCase(now.format('dddd'));
  const timeRange = plugin.configuration.time_range[day];
  if (!timeRange) {
    return false;
  }
  await user.update({'extra.plugins.office_hours.last_check': moment().valueOf()});
  const startTime = moment().utcOffset(timezone);
  const endTime = moment().utcOffset(timezone);
  const [startHour, startMinute] = timeRange.start.split(':');
  const [endHour, endMinute] = timeRange.end.split(':');
  startTime.set({hours: startHour, minutes: startMinute, seconds: 0});
  endTime.set({hours: endHour, minutes: endMinute, seconds: 59});
  let messageDisplayed = false;
  if (now.isBefore(startTime) || now.isAfter(endTime)) {
    const app = await appQueries.getApp(user.app);
    const agent = getAppAgent(app);
    await Promise.delay(SEND_MESSAGE_DELAY);
    await chatCommons.pushMessage(agent, user, plugin.configuration.reply);
    messageDisplayed = true;
  }
  return messageDisplayed;
}

async function sendReplySoonMessage(app, user) {
  const agent = getAppAgent(app);
  await Promise.delay(SEND_MESSAGE_DELAY_SMALL);
  await chatCommons.pushMessage(agent, user, REPLY_SOON_MESSAGE);
}

async function sendConnectChannelMessage(app, user) {
  const agent = getAppAgent(app);
  await Promise.delay(SEND_MESSAGE_DELAY_SMALL);
  await chatCommons.pushMessage(agent, user, CONNECT_CHANNEL_MESSAGE);
  await Promise.delay(SEND_MESSAGE_DELAY_SMALL);
  await chatCommons.pushConnectChannelMessage(agent, user, ['email']);
}

async function addPlugin(app, type, configuration) {
  let plugin = await pluginQueries.getPlugin(app, type, {require: false});
  if (plugin) {
    throw errors.ayroError('plugin_already_exists', 'Plugin already exists');
  }
  plugin = new Plugin({
    type,
    configuration,
    app: app.id,
    registration_date: new Date(),
  });
  return plugin.save();
}

async function updatePlugin(app, type, configuration) {
  const plugin = await pluginQueries.getPlugin(app, type);
  await plugin.update({configuration}, {runValidators: true});
  plugin.configuration = configuration;
  return plugin;
}

pubSub.subscribe(constants.pubSub.CHAT_VIEWS, async (data) => {
  try {
    const user = await userQueries.getUser(data.user.id);
    if (_.get(user, 'extra.metrics.chat_views') === 1) {
      const app = new App({id: user.app});
      const greetingsMessagePlugin = await pluginQueries.getPlugin(app, constants.plugin.types.GREETINGS_MESSAGE, {require: false});
      if (greetingsMessagePlugin) {
        await sendGreetingsMessageIfNeeded(greetingsMessagePlugin, user, data.channel);
      }
    }
  } catch (err) {
    logger.warn('Could not process "chat_views" event', err);
  }
});

pubSub.subscribe(constants.pubSub.MESSAGES_POSTED, async (data) => {
  try {
    const user = await userQueries.getUser(data.user.id);
    const app = await appQueries.getApp(user.app);
    const officeHoursPlugin = await pluginQueries.getPlugin(app, constants.plugin.types.OFFICE_HOURS, {require: false});
    const officeHoursMessageDisplayed = officeHoursPlugin ? await sendOfficeHoursMessageIfNeeded(officeHoursPlugin, user) : false;
    if (_.get(user, 'extra.metrics.messages_posted') === 1) {
      if (!officeHoursMessageDisplayed) {
        await sendReplySoonMessage(app, user);
      }
      await sendConnectChannelMessage(app, user);
    }
  } catch (err) {
    logger.warn('Could not process "messages_posted" event', err);
  }
});

exports.getPlugin = async (app, type, options) => {
  return pluginQueries.getPlugin(app, type, options);
};

exports.addOfficeHoursPlugin = async (app, configuration) => {
  return addPlugin(app, constants.plugin.types.OFFICE_HOURS, _.pick(configuration, CONFIG_OFFICE_HOURS));
};

exports.updateOfficeHoursPlugin = async (app, configuration) => {
  return updatePlugin(app, constants.plugin.types.OFFICE_HOURS, _.pick(configuration, CONFIG_OFFICE_HOURS));
};

exports.addGreetingsMessagePlugin = async (app, configuration) => {
  return addPlugin(app, constants.plugin.types.GREETINGS_MESSAGE, _.pick(configuration, CONFIG_GREETINGS_MESSAGE));
};

exports.updateGreetingsMessagePlugin = async (app, configuration) => {
  return updatePlugin(app, constants.plugin.types.GREETINGS_MESSAGE, _.pick(configuration, CONFIG_GREETINGS_MESSAGE));
};

exports.removePlugin = async (app, type) => {
  const plugin = await pluginQueries.getPlugin(app, type);
  await plugin.remove();
};
