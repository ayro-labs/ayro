'use strict';

const constants = require('utils/constants');
const pubSub = require('utils/pubSub');

exports.trackChatViews = async (user, channel) => {
  await user.update({$inc: {'extra.metrics.chat_views': 1}});
  await pubSub.publish(constants.pubSub.CHAT_VIEWS, {user, channel});
};

exports.trackMessagesPosted = async (user) => {
  await user.update({$inc: {'extra.metrics.messages_posted': 1}});
  await pubSub.publish(constants.pubSub.MESSAGES_POSTED, {user});
};
