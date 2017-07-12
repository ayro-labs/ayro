const settings = require('../configs/settings');
const logger = require('../utils/logger');
const errors = require('../utils/errors');
const User = require('../models').User;
const redis = require('redis');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

const redisClient = redis.createClient(settings.redis.port, settings.redis.host);
if (settings.redis.password) {
  redisClient.auth(settings.redis.password, (err) => {
    if (err) {
      logger.error('Could not authenticate to redis.', err);
      process.exit(1);
    }
  });
}

function createErrorGettingUserError(cause) {
  return errors.chatzError('session.user.errorGetting', 'Couldn\'t get session user', cause);
}

function createUserNotFoundError() {
  return errors.chatzError('session.user.notFound', 'Session user not found');
}

exports.getUser = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, settings.session.secret, (err, decoded) => {
      if (err || !decoded.jti) {
        reject(createErrorGettingUserError(err));
        return;
      }
      redisClient.get(settings.session.prefix + decoded.jti, (err, session) => {
        if (err) {
          reject(createErrorGettingUserError(err));
          return;
        }
        if (!session) {
          reject(createUserNotFoundError());
          return;
        }
        try {
          const sessionData = JSON.parse(session);
          resolve(new User(sessionData.user));
        } catch (err) {
          reject(createErrorGettingUserError(err));
        }
      });
    });
  });
};
