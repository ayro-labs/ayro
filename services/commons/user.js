'use strict';

const {User} = require('../../models');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const files = require('../../utils/files');
const {logger} = require('@ayro/commons');
const randomName = require('node-random-name');
const _ = require('lodash');

const $ = this;

const UNALLOWED_ATTRS = ['_id', 'id', 'app', 'photo', 'random_name', 'registration_date'];

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
  const user = new User(_.omit(data, UNALLOWED_ATTRS));
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
  const finalData = _.omit(data, UNALLOWED_ATTRS);
  if (finalData.first_name || finalData.last_name) {
    finalData.random_name = false;
  }
  if (finalData.photo_url && finalData.photo_url !== loadedUser.photo_url) {
    try {
      loadedUser.set(finalData);
      finalData.photo = await files.downloadUserPhoto(loadedUser);
    } catch (err) {
      logger.debug('Could not download photo of user %s: %s.', loadedUser.id, err.message);
    }
  }
  return User.findByIdAndUpdate(loadedUser.id, finalData, {new: true, runValidators: true}).exec();
};
