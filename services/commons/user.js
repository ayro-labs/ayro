'use strict';

let User = require('../../models').User,
    errors = require('../../utils/errors'),
    Promise = require('bluebird');

let fillQuery = function(promise, options) {
  if (options) {
    if (options.populate) {
      promise.populate(options.populate);
    }
    if (options.lean) {
      promise.lean();
    }
  }
};

exports.getUser = function(id, options) {
  return Promise.resolve().then(function() {
    let promise = User.findById(id);
    fillQuery(promise, options);
    return promise.exec();
  }).then(function(user) {
    if (!user) {
      throw errors.notFoundError('user.doesNotExist', 'User does not exist');
    }
    return user;
  });
};

exports.findUser = function(query, options) {
  return Promise.resolve().then(function() {
    let promise = User.findOne(query);
    fillQuery(promise, options);
    return promise.exec();
  }).then(function(user) {
    if (!user) {
      throw errors.notFoundError('user.doesNotExist', 'User does not exist');
    }
    return user;
  });
};