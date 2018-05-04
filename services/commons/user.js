'use strict';

const {User} = require('../../models');
const errors = require('../../utils/errors');
const files = require('../../utils/files');
const hash = require('../../utils/hash');
const userQueries = require('../../utils/queries/user');
const {logger} = require('@ayro/commons');
const randomName = require('node-random-name');
const _ = require('lodash');

const UNALLOWED_ATTRS = ['_id', 'id', 'app', 'photo', 'random_name', 'registration_date'];

async function createUser(app, data, identified) {
  if (identified && !data.uid) {
    throw errors.ayroError('user_uid_required', 'Uid is required');
  }
  const user = new User(_.omit(data, UNALLOWED_ATTRS));
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
      user.photo = await files.downloadUserPhoto(user, data.photo_url);
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
  const finalData = _.omit(data, UNALLOWED_ATTRS);
  if (finalData.first_name || finalData.last_name) {
    finalData.random_name = false;
  }
  if (finalData.photo_url && finalData.photo_url !== loadedUser.photo_url) {
    try {
      finalData.photo = await files.downloadUserPhoto(loadedUser, finalData.photo_url);
    } catch (err) {
      logger.debug('Could not download photo of user %s: %s.', loadedUser.id, err.message);
      finalData.photo_url = null;
    }
  }
  await loadedUser.update(finalData, {runValidators: true});
  loadedUser.set(finalData);
  return loadedUser;
};
