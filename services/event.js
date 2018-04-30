'use strict';

const constants = require('../utils/constants');
const pubSub = require('pubsub-js');

exports.trackViewChat = async (user) => {
  await user.update({$inc: {'extra.events.view_chat' : 1}});
  pubSub.publish(constants.events.VIEW_CHAT, user);
};

exports.trackPostMessage = async (user) => {
  await user.update({$inc: {'extra.events.post_message' : 1}});
  pubSub.publish(constants.events.POST_MESSAGE, user);
};