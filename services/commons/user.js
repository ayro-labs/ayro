'use strict';

const {User} = require('models');
const errors = require('utils/errors');
const files = require('utils/files');
const hash = require('utils/hash');
const userQueries = require('utils/queries/user');
const {logger} = require('@ayro/commons');
const randomName = require('node-random-name');
const _ = require('lodash');

const UNALLOWED_ATTRS = ['_id', 'id', 'app', 'photo', 'random_name', 'registration_date'];
const UNALLOWED_ATTRS_UPDATE = ['uid', ...UNALLOWED_ATTRS];

async function createUser(app, data, identified) {
  if (identified && !data.uid) {
    throw errors.ayroError('user_uid_required', 'Uid is required');
  }
  const attrs = _.omit(data, UNALLOWED_ATTRS);
  const user = new User(attrs);
  user.app = app.id;
  user.random_name = false;
  user.identified = identified || false;
  user.transient = !user.identified;
  user.registration_date = new Date();
  if (!user.uid) {
    user.uid = hash.uuid();
  }
  if (!user.first_name && !user.last_name) {
    [user.first_name, user.last_name] = _.split(randomName(), ' ');
    user.random_name = true;
  }
  if (data.photo_url) {
    try {
      user.photo = await files.uploadUserPhoto(user, data.photo_url);
    } catch (err) {
      logger.debug('Could not download photo of user %s: %s.', user.id, err.message);
      user.photo_url = null;
    }
  }
  return user.save();
}

exports.createIdentifiedUser = async (app, data) => {
  return createUser(app, data, true);
};

exports.createAnonymousUser = async (app, data) => {
  return createUser(app, data, false);
};

exports.updateUser = async (user, data) => {
  const loadedUser = await userQueries.getUser(user.id);
  const attrs = _.omit(data, UNALLOWED_ATTRS_UPDATE);
  if (attrs.first_name || attrs.last_name) {
    attrs.random_name = false;
  }
  if (attrs.photo_url && attrs.photo_url !== loadedUser.photo_url) {
    try {
      attrs.photo = await files.uploadUserPhoto(loadedUser, attrs.photo_url);
    } catch (err) {
      logger.debug('Could not download photo of user %s: %s.', loadedUser.id, err.message);
      attrs.photo_url = null;
    }
  }
  await loadedUser.update(attrs, {runValidators: true});
  loadedUser.set(attrs);
  return loadedUser;
};
