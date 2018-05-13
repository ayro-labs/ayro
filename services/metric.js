'use strict';

exports.incrementChatViews = async (user) => {
  await user.update({$inc: {'extra.metrics.chat_views': 1}});
};

exports.incrementMessagesPosted = async (user) => {
  await user.update({$inc: {'extra.metrics.messages_posted': 1}});
};
