const {User} = require('../../models');
const settings = require('../../configs/settings');
const logger = require('../../utils/logger');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const files = require('../../utils/files');
const path = require('path');
const Promise = require('bluebird');
const randomName = require('node-random-name');
const _ = require('lodash');

const $ = this;

const UNALLOWED_ATTRS = ['_id', 'app', 'photo', 'generated_name', 'registration_date'];

function throwUserNotFoundIfNeeded(user, options) {
  if (!user && (!options || options.require)) {
    throw errors.notFoundError('user.doesNotExist', 'User does not exist');
  }
}

exports.getUser = (id, options) => {
  return Promise.coroutine(function* () {
    const promise = User.findById(id);
    queries.fillQuery(promise, options);
    const user = yield promise.exec();
    throwUserNotFoundIfNeeded(user, options);
    return user;
  })();
};

exports.findUser = (query, options) => {
  return Promise.coroutine(function* () {
    const promise = User.findOne(query);
    queries.fillQuery(promise, options);
    const user = yield promise.exec();
    throwUserNotFoundIfNeeded(user, options);
    return user;
  })();
};

exports.createUser = (app, data) => {
  return Promise.coroutine(function* () {
    if (!data.uid) {
      throw errors.chatzError('user.uid.required', 'User unique id is required');
    }
    const user = new User(_.omit(data, UNALLOWED_ATTRS));
    user.app = app.id;
    user.registration_date = new Date();
    user.generated_name = false;
    if (!user.first_name && !user.last_name) {
      [user.first_name, user.last_name] = _.split(randomName(), ' ');
      user.generated_name = true;
    }
    try {
      user.photo = yield files.downloadUserPhoto(user);
    } catch (err) {
      logger.debug('Could not download photo of user %s: %s.', user.id, err.message);
    }
    return user.save();
  })();
};

exports.updateUser = (user, data) => {
  return Promise.coroutine(function* () {
    const currentUser = yield $.getUser(user.id);
    const allowedData = _.omit(data, UNALLOWED_ATTRS);
    if (user.first_name || user.last_name) {
      allowedData.generated_name = false;
    }
    if (allowedData.photo_url && allowedData.photo_url !== currentUser.photo_url) {
      try {
        currentUser.set(allowedData);
        allowedData.photo = yield files.downloadUserPhoto(currentUser);
      } catch (err) {
        logger.debug('Could not download photo of user %s: %s.', currentUser.id, err.message);
      }
    }
    return User.findByIdAndUpdate(currentUser.id, allowedData, {new: true, runValidators: true}).exec();
  })();
};
