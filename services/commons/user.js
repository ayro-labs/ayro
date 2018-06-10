'use strict';

const errors = require('utils/errors');
const files = require('utils/files');
const hash = require('utils/hash');
const userQueries = require('database/queries/user');
const {User} = require('models');
const {logger} = require('@ayro/commons');
const randomName = require('node-random-name');
const _ = require('lodash');

const DEFAULT_AVATAR_URL = 'https://cdn.ayro.io/images/user_default_avatar.png';

async function createUser(app, data, identified) {
  if (identified && !data.uid) {
    throw errors.ayroError('user_uid_required', 'Uid is required');
  }
  const user = new User(data);
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
  if (user.photo_url) {
    try {
      const avatar = await files.uploadUserAvatar(user, user.photo_url);
      user.avatar_url = avatar.url;
    } catch (err) {
      logger.debug('Could not upload avatar of user %s: %s.', user.id, err.message);
      user.photo_url = null;
    }
  }
  if (!user.avatar_url) {
    user.avatar_url = DEFAULT_AVATAR_URL;
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
  const attrs = _.cloneDeep(data);
  if (attrs.first_name || attrs.last_name) {
    attrs.random_name = false;
  }
  if (attrs.photo_url && attrs.photo_url !== loadedUser.photo_url) {
    try {
      const avatar = await files.uploadUserAvatar(loadedUser, attrs.photo_url);
      attrs.avatar_url = avatar.url;
    } catch (err) {
      logger.debug('Could not upload avatar of user %s: %s.', loadedUser.id, err.message);
      attrs.photo_url = null;
    }
  }
  await loadedUser.update(attrs, {runValidators: true});
  loadedUser.set(attrs);
  return loadedUser;
};
