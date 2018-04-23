'use strict';

const {Account, User, Device} = require('../models');
const settings = require('../configs/settings');
const errors = require('../utils/errors');
const redis = require('redis');
const JwtRedis = require('jsonwebtoken-redis');

const SCOPE_ACCOUNT = 'account';
const SCOPE_USER = 'user';

const redisClient = redis.createClient({
  host: settings.redis.host,
  port: settings.redis.port,
  password: settings.redis.password,
});

const jwtRedis = new JwtRedis(redisClient, settings.session.expiresIn);

exports.createAccountToken = async (account) => {
  try {
    const decoded = await jwtRedis.sign({scope: SCOPE_ACCOUNT, account: account.id}, settings.session.secret, {
      expiresKeyIn: settings.session.expiresIn,
      keyid: settings.session.keyId,
    });
    return decoded;
  } catch (err) {
    if (err instanceof JwtRedis.TokenExpiredError) {
      throw errors.authorizationError('token_expired', 'Token expired');
    }
    throw err;
  }
};

exports.createUserToken = async (user, device) => {
  try {
    const decoded = await jwtRedis.sign({scope: SCOPE_USER, user: user.id, device: device.id}, settings.session.secret, {
      expiresKeyIn: settings.session.expiresIn,
      keyid: settings.session.keyId,
    });
    return decoded;
  } catch (err) {
    if (err instanceof JwtRedis.TokenExpiredError) {
      throw errors.authorizationError('token_expired', 'Token expired');
    }
    throw err;
  }
};

exports.decodeToken = async (token) => {
  const result = {};
  try {
    if (token) {
      const decoded = await jwtRedis.decode(token, {complete: true});
      if (decoded.header.kid === settings.session.keyId) {
        const payload = await jwtRedis.verify(token, settings.session.secret);
        switch (payload.scope) {
          case SCOPE_ACCOUNT:
            result.account = new Account({id: payload.account});
            break;
          case SCOPE_USER:
            result.user = new User({id: payload.user});
            result.device = new Device({id: payload.device});
            break;
        }
      }
    }
  } catch (err) {
    if (err instanceof JwtRedis.TokenExpiredError) {
      throw errors.authorizationError('token_expired', 'Token expired');
    }
  }
  return result;
};

exports.touchToken = async (token) => {
  if (token) {
    await jwtRedis.touch(token);
  }
};

exports.destroyToken = async (token) => {
  if (token) {
    await jwtRedis.destroy(token);
  }
};
