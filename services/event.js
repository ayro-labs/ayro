'use strict';

exports.trackViewChat = async (user) => {
  await user.update({$inc: {'extra.events.view_chat': 1}});
};

exports.trackPostMessage = async (user) => {
  await user.update({$inc: {'extra.events.post_message': 1}});
};
