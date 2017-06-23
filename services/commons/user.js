'use strict';

let User = require('../../models').User,
    errors = require('../../utils/errors'),
    Promise = require('bluebird');

exports.getUser = function(id, populate) {
  return Promise.resolve().then(function() {
    let promise = User.findById(id);
    if (populate) {
      promise.populate(populate);
    }
    return promise.exec();
  }).then(function(user) {
    if (!user) {
      throw errors.notFoundError('user.doesNotExist', 'User does not exist');
    }
    return user;
  });
};