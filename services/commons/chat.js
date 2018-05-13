'use strict';

const {App, ChatMessage} = require('../../models');
const constants = require('../../utils/constants');
const integrationQueries = require('../../utils/queries/integration');
const userQueries = require('../../utils/queries/user');
const deviceQueries = require('../../utils/queries/device');
const webPush = require('../integrations/push/web');
const androidPush = require('../integrations/push/android');
const messengerPush = require('../integrations/push/messenger');

const EVENT_CHAT_MESSAGE = 'chat_message';

async function push(configuration, user, device, event, message) {
  switch (device.platform) {
    case constants.device.platforms.BROWSER.id:
      return webPush.push(configuration, user, device, event, message);
    case constants.device.platforms.ANDROID.id:
      return androidPush.push(configuration, user, device, event, message);
    case constants.device.platforms.MESSENGER.id:
      return messengerPush.push(configuration, user, device, event, message);
    default:
      return null;
  }
}

exports.pushMessage = async (agent, user, text, channel) => {
  const loadedUser = await userQueries.getUser(user.id);
  const app = new App({id: loadedUser.app});
  const userChannel = channel || loadedUser.latest_channel;
  const integration = await integrationQueries.getIntegration(app, userChannel);
  const device = await deviceQueries.findDevice({user: loadedUser.id, channel: userChannel});
  const chatMessage = new ChatMessage({
    agent,
    text,
    app: loadedUser.app,
    user: loadedUser.id,
    type: constants.chatMessage.types.TEXT,
    channel: userChannel,
    direction: constants.chatMessage.directions.INCOMING,
    date: new Date(),
  });
  await push(integration.configuration, loadedUser, device, EVENT_CHAT_MESSAGE, chatMessage);
  return chatMessage.save();
};

exports.pushLinkChannelMessage = async (user, availableChannels, channel) => {
  const loadedUser = await userQueries.getUser(user.id);
  const app = new App({id: loadedUser.app});
  const userChannel = channel || loadedUser.latest_channel;
  const integration = await integrationQueries.getIntegration(app, userChannel);
  const device = await deviceQueries.findDevice({user: loadedUser.id, channel: userChannel});
  const chatMessage = new ChatMessage({
    app: loadedUser.app,
    user: loadedUser.id,
    type: constants.chatMessage.types.CONNECT_CHANNELS,
    channel: userChannel,
    direction: constants.chatMessage.directions.INCOMING,
    metadata: {
      available_channels: availableChannels,
    },
    date: new Date(),
  });
  await push(integration.configuration, loadedUser, device, EVENT_CHAT_MESSAGE, chatMessage);
};
