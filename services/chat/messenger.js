'use strict';

const {App, Device} = require('../../models');
const constants = require('../../utils/constants');
const hash = require('../../utils/hash');
const apis = require('../../utils/apis');
const userCommons = require('../commons/user');
const deviceCommons = require('../commons/device');
const integrationCommons = require('../commons/integration');
const chatService = require('.');
const _ = require('lodash');

function getUserData(profile) {
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    uid: hash.uuid(),
    identified: false,
  };
}

function getDeviceData(user, profile, data) {
  return {
    uid: hash.uuid(),
    platform: constants.device.platforms.MESSENGER.id,
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
  const user = await userCommons.createUser(new App({id: integration.app}), getUserData(profile));
  const device = await deviceCommons.createDevice(user, getDeviceData(user, profile, data));
  return Device.populate(device, 'user');
}

exports.postMessage = async (data) => {
  if (!data.message.text) {
    return;
  }
  const integration = await integrationCommons.findIntegration({channel: constants.integration.channels.MESSENGER, 'configuration.page.id': data.recipient.id}, {require: false});
  if (!integration) {
    return;
  }
  const devices = await deviceCommons.findDevices({'info.profile_id': data.sender.id}, {populate: 'user'});
  let device = devices.find(device => device.user.app.toString() === integration.app.toString());
  if (!device) {
    device = await createDevice(integration, data);
  }
  await chatService.postMessage(device.user, device, constants.integration.channels.MESSENGER, {text: data.message.text});
};
