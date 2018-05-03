'use strict';

exports.incrementChatViews = async (user) => {
  await user.update({$inc: {'extra.metrics.chat_views': 1}});
};
