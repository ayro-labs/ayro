'use strict';

const constants = require('utils/constants');
const integrationQueries = require('database/queries/integration');
const userQueries = require('database/queries/user');
const deviceQueries = require('database/queries/device');
const webPush = require('services/commons/chat/push/web');
const androidPush = require('services/commons/chat/push/android');
const messengerPush = require('services/commons/chat/push/messenger');
const {App, ChatMessage} = require('models');

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

exports.pushConnectChannelMessage = async (agent, user, availableChannels) => {
  const loadedUser = await userQueries.getUser(user.id);
  const app = new App({id: loadedUser.app});
  const integration = await integrationQueries.getIntegration(app, loadedUser.latest_channel);
  const device = await deviceQueries.findDevice({user: loadedUser.id, channel: loadedUser.latest_channel});
  const chatMessage = new ChatMessage({
    agent,
    app: loadedUser.app,
    user: loadedUser.id,
    type: constants.chatMessage.types.CONNECT_CHANNELS,
    channel: loadedUser.latest_channel,
    direction: constants.chatMessage.directions.INCOMING,
    metadata: {
      available_channels: availableChannels,
    },
    date: new Date(),
  });
  await push(integration.configuration, loadedUser, device, EVENT_CHAT_MESSAGE, chatMessage);
  return chatMessage.save();
};
