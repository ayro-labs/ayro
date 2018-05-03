'use strict';

const {ChatMessage} = require('../../models');
const constants = require('../../utils/constants');
const userQueries = require('../../utils/queries/user');
const push = require('../integrations/push');

const EVENT_CHAT_MESSAGE = 'chat_message';

exports.pushMessage = async (agent, user, text, channel) => {
  const loadedUser = await userQueries.getUser(user.id, {populate: 'latest_device'});
  const chatMessage = new ChatMessage({
    agent,
    text,
    app: loadedUser.app,
    user: loadedUser.id,
    device: loadedUser.latest_device,
    direction: constants.chatMessage.directions.INCOMING,
    date: new Date(),
  });
  await push.message(loadedUser, EVENT_CHAT_MESSAGE, chatMessage, channel);
  return chatMessage.save();
};
