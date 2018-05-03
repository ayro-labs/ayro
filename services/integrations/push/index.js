'use strict';

const {App} = require('../../../models');
const constants = require('../../../utils/constants');
const integrationQueries = require('../../../utils/queries/integration');
const webPush = require('./web');
const androidPush = require('./android');
const messengerPush = require('./messenger');

exports.message = async (user, event, message, channel) => {
  const integration = await integrationQueries.getIntegration(new App({id: user.app}), channel || user.latest_channel);
  const device = user.latest_device;
  switch (device.platform) {
    case constants.device.platforms.WEB.id:
      return webPush.push(integration.configuration, user, device, event, message);
    case constants.device.platforms.ANDROID.id:
      return androidPush.push(integration.configuration, user, device, event, message);
    case constants.device.platforms.MESSENGER.id:
      return messengerPush.push(integration.configuration, user, device, event, message);
    default:
      return null;
  }
};
