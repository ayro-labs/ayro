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

let throwErrorGettingUser = function(cause) {
  throw errors.chatzError('session.user.errorGetting', 'Couldn\'t get session user', cause);
};

let throwUserNotFound = function() {
  throw errors.chatzError('session.user.notFound', 'Session user not found');
};

exports.getUser = function(token) {
  return Promise.resolve().then(function() {
    jwt.verify(message.ext.api_token, settings.session.secret, function(err, decoded) {
      if (err || !decoded.jti) {
        throwErrorGettingUser(err);
      }
      redisClient.get(settings.session.prefix + decoded.jti, function(err, session) {
        if (err) {
          throwErrorGettingUser(err);
        }
        if (!session) {
          throwUserNotFound();
        }
        try {
          let sessionData = JSON.parse(session);
          return new User(sessionData.user);
        } catch(err) {
          throwErrorGettingUser(err);
        }
      });
    });
  });
};