'use strict';

const {User, ChatMessage} = require('../../models');
const constants = require('../../utils/constants');
const push = require('../integrations/push');

const EVENT_CHAT_MESSAGE = 'chat_message';

exports.pushMessage = async (agent, user, text, channel) => {
  await User.populate(user, 'latest_device');
  const chatMessage = new ChatMessage({
    agent,
    text,
    user: user.id,
    device: user.latest_device.id,
    direction: constants.chatMessage.directions.INCOMING,
    date: new Date(),
  });
  await push.message(user, EVENT_CHAT_MESSAGE, chatMessage, channel);
  return chatMessage.save();
};
