const {User} = require('../models');
const settings = require('../configs/settings');
const errors = require('../utils/errors');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

const redisClient = redis.createClient({
  host: settings.redis.host,
  port: settings.redis.port,
  password: settings.redis.password,
});

const verifyAsync = Promise.promisify(jwt.verify);
const getAsync = Promise.promisify(redisClient.get);

function createErrorGettingUserError(cause) {
  return errors.chatzError('session.user.errorGetting', 'Couldn\'t get session user', cause);
}

function createUserNotFoundError() {
  return errors.chatzError('session.user.notFound', 'Session user not found');
}

exports.getUser = (token) => {
  return Promise.coroutine(function* () {
    const decoded = yield verifyAsync(token, settings.session.secret).catch((err) => {
      throw createErrorGettingUserError(err);
    });
    if (!decoded.jti) {
      throw createErrorGettingUserError();
    }
    const session = yield getAsync(settings.session.prefix + decoded.jti).catch((err) => {
      throw createErrorGettingUserError(err);
    });
    if (!session) {
      throw createUserNotFoundError();
    }
    try {
      const sessionData = JSON.parse(session);
      return new User(sessionData.user);
    } catch (err) {
      throw createErrorGettingUserError(err);
    }
  })();
};
