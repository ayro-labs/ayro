'use strict';

let User = require('../../models').User,
    errors = require('../../utils/errors');

exports.getUser = function(id, populate) {
  return User.findById(id).populate(populate).exec().then(function(user) {
    if (!user) {
      throw errors.notFoundError('user.doesNotExist', 'User does not exist');
    }
    return user;
  });
};