'use strict';

const {User} = require('../../models');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const files = require('../../utils/files');
const {logger} = require('@ayro/commons');
const randomName = require('node-random-name');
const _ = require('lodash');

const $ = this;

const ALLOWED_ATTRIBUTES = ['uid', 'first_name', 'last_name', 'email', 'photo_url', 'properties', 'sign_up_date', 'identified'];

function throwUserNotFoundIfNeeded(user, options) {
  if (!user && (!options || options.require)) {
    throw errors.notFoundError('user_not_found', 'User not found');
  }
}

exports.getUser = async (id, options) => {
  const promise = User.findById(id);
  queries.fillQuery(promise, options);
  const user = await promise.exec();
  throwUserNotFoundIfNeeded(user, options);
  return user;
};

exports.findUser = async (query, options) => {
  const promise = User.findOne(query);
  queries.fillQuery(promise, options);
  const user = await promise.exec();
  throwUserNotFoundIfNeeded(user, options);
  return user;
};

exports.createUser = async (app, data) => {
  if (!data.uid) {
    throw errors.ayroError('user_uid_required', 'User unique id is required');
  }
  const user = new User(_.pick(data, ALLOWED_ATTRIBUTES));
  user.app = app.id;
  user.registration_date = new Date();
  user.random_name = false;
  if (!user.first_name && !user.last_name) {
    [user.first_name, user.last_name] = _.split(randomName(), ' ');
    user.random_name = true;
  }
  try {
    user.photo = await files.downloadUserPhoto(user);
  } catch (err) {
    logger.debug('Could not download photo of user %s: %s.', user.id, err.message);
  }
  return user.save();
};

exports.updateUser = async (user, data) => {
  const loadedUser = await $.getUser(user.id);
  const allowedData = _.pick(data, ALLOWED_ATTRIBUTES);
  if (allowedData.first_name || allowedData.last_name) {
    allowedData.random_name = false;
  }
  if (allowedData.photo_url && allowedData.photo_url !== loadedUser.photo_url) {
    try {
      loadedUser.set(allowedData);
      allowedData.photo = await files.downloadUserPhoto(loadedUser);
    } catch (err) {
      logger.debug('Could not download photo of user %s: %s.', loadedUser.id, err.message);
    }
  }
  return User.findByIdAndUpdate(loadedUser.id, allowedData, {new: true, runValidators: true}).exec();
};
