'use strict';

const {App, Device} = require('../../models');
const constants = require('../../utils/constants');
const hash = require('../../utils/hash');
const apis = require('../../utils/apis');
const integrationQueries = require('../../utils/queries/integration');
const deviceQueries = require('../../utils/queries/device');
const userCommons = require('../commons/user');
const deviceCommons = require('../commons/device');
const chatService = require('.');
const _ = require('lodash');

function getUserData(profile) {
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
  };
}

function getDeviceData(user, profile, data) {
  return {
    uid: hash.uuid(),
    platform: constants.device.platforms.MESSENGER.id,
    channel: constants.integration.channels.MESSENGER,
    info: {
      profile_id: data.sender.id,
      profile_name: user.getFullName(),
      profile_picture: profile.profile_pic,
      profile_gender: profile.gender ? _.toLower(profile.gender) : null,
      profile_locale: profile.locale,
      profile_timezone: profile.timezone,
    },
  };
}

async function createDevice(integration, data) {
  const profile = await apis.facebook(integration.configuration, true).api(data.sender.id);
  const user = await userCommons.createAnonymousUser(new App({id: integration.app}), getUserData(profile));
  const device = await deviceCommons.createDevice(user, getDeviceData(user, profile, data));
  device.user = user;
  return device;
}

exports.postMessage = async (data) => {
  if (!data.message.text) {
    return;
  }
  const integration = await integrationQueries.findIntegration({channel: constants.integration.channels.MESSENGER, 'configuration.page.id': data.recipient.id}, {require: false});
  if (!integration) {
    return;
  }
  const devices = await deviceQueries.findDevices({platform: constants.device.platforms.MESSENGER.id, 'info.profile_id': data.sender.id}, {populate: 'user'});
  let device = _.find(devices, (currentDevice) => {
    return currentDevice.user.app.toString() === integration.app.toString();
  });
  if (!device) {
    device = await createDevice(integration, data);
  }
  await chatService.postMessage(device.user, constants.integration.channels.MESSENGER, {text: data.message.text});
};
