'use strict';

let User = require('../../models').User,
    errors = require('../../utils/errors'),
    Promise = require('bluebird'),
    _ = require('lodash');

let fillQuery = function(promise, options) {
  if (options) {
    if (!_.has(options, 'require')) {
      options.require = true;
    }
    if (options.populate) {
      promise.populate(options.populate);
    }
    if (options.lean) {
      promise.lean();
    }
  }
};

let throwNotFoundIfNeeded = function(user, options) {
  if (!user && (!options || options.require === true)) {
    throw errors.notFoundError('user.doesNotExist', 'User does not exist');
  }
};

exports.getUser = function(id, options) {
  return Promise.resolve().then(function() {
    let promise = User.findById(id);
    fillQuery(promise, options);
    return promise.exec();
  }).then(function(user) {
    throwNotFoundIfNeeded(user, options);
    return user;
  });
};

exports.findUser = function(query, options) {
  return Promise.resolve().then(function() {
    let promise = User.findOne(query);
    fillQuery(promise, options);
    return promise.exec();
  }).then(function(user) {
    throwNotFoundIfNeeded(user, options);
    return user;
  });
};