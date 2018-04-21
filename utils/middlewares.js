'use strict';

const session = require('../utils/session');
const errors = require('../utils/errors');
const {logger} = require('@ayro/commons');

exports.decodeToken = async (req) => {
  if (req.token) {
    await session.touchToken(req.token);
    const decodedToken = await session.decodeToken(req.token);
    if (decodedToken.account) {
      req.account = decodedToken.account;
      logger.debug('%s %s [Account %s]', req.method, req.path, req.account.id);
    }
    if (decodedToken.user) {
      req.user = decodedToken.user;
      logger.debug('%s %s [User %s]', req.method, req.path, req.user.id);
    }
    if (decodedToken.device) {
      req.device = decodedToken.device;
      logger.debug('%s %s [Device %s]', req.method, req.path, req.device.id);
    }
  }
};

exports.isUserAuthenticated = async (req, res, next) => {
  try {
    await this.decodeToken(req);
    if (req.user) {
      next();
    } else {
      errors.respondWithError(res, errors.authenticationError('authentication_required', 'Authentication required'));
    }
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};

exports.isAccountAuthenticated = async (req, res, next) => {
  try {
    await this.decodeToken(req);
    if (req.account) {
      next();
    } else {
      errors.respondWithError(res, errors.authenticationError('authentication_required', 'Authentication required'));
    }
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};
