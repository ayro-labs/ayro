'use strict';

const appService = require('services/app');
const session = require('utils/session');
const errors = require('utils/errors');
const {logger} = require('@ayro/commons');

exports.decodeToken = async (req) => {
  if (req.token) {
    await session.touchToken(req.token);
    const decodedToken = await session.decodeToken(req.token);
    if (decodedToken.account) {
      req.account = decodedToken.account;
      logger.debug('%s %s [Account: %s]', req.method, req.path, req.account.id);
    }
    if (decodedToken.user && decodedToken.device && decodedToken.channel) {
      req.user = decodedToken.user;
      req.device = decodedToken.device;
      req.channel = decodedToken.channel;
      logger.debug('%s %s [User: %s, Device: %s, Channel: %s]', req.method, req.path, req.user.id, req.device.id, req.channel);
    }
  }
};

exports.userAuthenticated = async (req, res, next) => {
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

exports.accountAuthenticated = async (req, res, next) => {
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

exports.accountOwnsApp = async (req, res, next) => {
  try {
    if (!req.account) {
      errors.respondWithError(res, errors.authenticationError('authentication_required', 'Authentication required'));
      return;
    }
    const appId = req.params.app || req.body.app;
    if (!appId || (await appService.appExists({_id: appId, account: req.account.id}))) {
      errors.respondWithError(res, errors.notFoundError('app_not_found', 'App not found'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};
