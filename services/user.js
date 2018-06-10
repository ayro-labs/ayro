'use strict';

const errors = require('utils/errors');
const userQueries = require('database/queries/user');
const userCommons = require('services/commons/user');
const {AppSecret, ChatMessage} = require('models');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const ALLOWED_ATTRS = ['uid', 'first_name', 'last_name', 'email', 'photo_url', 'properties', 'sign_up_date'];
const JWT_SCOPE_USER = 'user';

exports.saveIdentifiedUser = async (app, data, jwtToken) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  if (!jwtToken) {
    throw errors.ayroError('jwt_required', 'JWT token is required');
  }
  if (attrs.uid) {
    const decoded = jwt.decode(jwtToken, {complete: true});
    if (!decoded) {
      throw errors.ayroError('jwt_invalid', 'Invalid JWT token');
    }
    if (!decoded.header.kid) {
      throw errors.ayroError('jwt_invalid', 'JWT token requires kid header');
    }
    const appSecret = await AppSecret.findOne({_id: decoded.header.kid, app: app.id});
    if (!appSecret) {
      throw errors.ayroError('jwt_invalid', 'App secret not found');
    }
    const payload = jwt.verify(jwtToken, appSecret.secret);
    if (payload.scope !== JWT_SCOPE_USER || payload.userId !== attrs.uid) {
      throw errors.ayroError('jwt_invalid', 'User\'s uid not match');
    }
  }
  const user = await userQueries.findUser({app: app.id, uid: attrs.uid}, {require: false});
  return user ? this.updateUser(user, attrs) : userCommons.createIdentifiedUser(app, attrs);
};

exports.saveAnonymousUser = async (app, uid) => {
  const user = await userQueries.findUser({app: app.id, uid}, {require: false});
  return user || userCommons.createAnonymousUser(app, {uid});
};

exports.updateUser = async (user, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  return userCommons.updateUser(user, attrs);
};

exports.getUser = async (id) => {
  return userQueries.getUser(id);
};

exports.mergeUsers = async (user, survivingUser) => {
  const loadedUser = await userQueries.getUser(user.id);
  const loadedSurvivingUser = await userQueries.getUser(survivingUser.id);
  if (loadedUser.app.toString() !== loadedSurvivingUser.app.toString()) {
    throw errors.internalError('Can not merge users from different apps');
  }
  if (!loadedUser.identified && loadedSurvivingUser.identified) {
    await ChatMessage.update({user: loadedUser.id}, {user: loadedSurvivingUser.id});
    await loadedUser.update({transient: true}, {runValidators: true});
  }
};
