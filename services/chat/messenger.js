'use strict';

const constants = require('utils/constants');
const hash = require('utils/hash');
const apis = require('utils/apis');
const integrationQueries = require('database/queries/integration');
const deviceQueries = require('database/queries/device');
const userCommons = require('services/commons/user');
const deviceCommons = require('services/commons/device');
const chatService = require('services/chat');
const {App} = require('models');
const _ = require('lodash');

function getUserData(profile) {
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    photo_url: profile.profile_pic,
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

async function getDevice(integration, data) {
  const devices = await deviceQueries.findDevices({platform: constants.device.platforms.MESSENGER.id, 'info.profile_id': data.sender.id}, {populate: 'user'});
  let device = _.find(devices, (currentDevice) => {
    return currentDevice.user.app.toString() === integration.app.toString();
  });
  if (!device) {
    const profile = await apis.facebook(integration.configuration, true).api(data.sender.id);
    const user = await userCommons.createAnonymousUser(new App({id: integration.app}), getUserData(profile));
    device = await deviceCommons.createDevice(user, getDeviceData(user, profile, data));
    device.user = user;
  }
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
  const device = await getDevice(integration, data);
  await chatService.postMessage(device.user, constants.integration.channels.MESSENGER, {text: data.message.text});
};
