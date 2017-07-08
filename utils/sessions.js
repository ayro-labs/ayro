'use strict';

let settings = require('../configs/settings'),
    errors = require('../utils/errors'),
    User = require('../models').User,
    redis = require('redis'),
    jwt = require('jsonwebtoken'),
    Promise = require('bluebird');

let redisClient = redis.createClient(settings.redis.port, settings.redis.host);
redisClient.auth(settings.redis.password, function(err) {
  if (err) {
    throw new Error('Error authenticating Redis client');
  }
});

let createErrorGettingUserError = function(cause) {
  return errors.chatzError('session.user.errorGetting', 'Couldn\'t get session user', cause);
};

let createUserNotFoundError = function() {
  return errors.chatzError('session.user.notFound', 'Session user not found');
};

exports.getUser = function(token) {
  return new Promise(function(resolve, reject) {
    jwt.verify(token, settings.session.secret, function(err, decoded) {
      if (err || !decoded.jti) {
        reject(createErrorGettingUserError(err));
        return;
      }
      redisClient.get(settings.session.prefix + decoded.jti, function(err, session) {
        if (err) {
          reject(createErrorGettingUserError(err));
          return;
        }
        if (!session) {
          reject(createUserNotFoundError());
          return;
        }
        try {
          let sessionData = JSON.parse(session);
          resolve(new User(sessionData.user));
        } catch(err) {
          reject(createErrorGettingUserError(err));
        }
      });
    });
  });
};