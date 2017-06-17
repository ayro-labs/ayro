'use strict';

let User = require('../models').User,
    push = require('./internals/push');

exports.postMessage = function(user, message) {

};

exports.pushMessage = function(user, message) {
  return User.findById(user._id).populate('project devices').exec().then(function(user) {
    if (user) {
      return push.chatMessage(user, message);
    }
  });
};