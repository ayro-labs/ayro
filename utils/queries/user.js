'use strict';

const {User} = require('models');
const errors = require('utils/errors');
const queriesCommon = require('utils/queries/common');

function throwUserNotFoundIfNeeded(user, options) {
  if (!user && (!options || options.require)) {
    throw errors.notFoundError('user_not_found', 'User not found');
  }
}

exports.getUser = async (id, options) => {
  const promise = User.findById(id);
  queriesCommon.fillQuery(promise, options);
  const user = await promise.exec();
  throwUserNotFoundIfNeeded(user, options);
  return user;
};

exports.findUser = async (query, options) => {
  const promise = User.findOne(query);
  queriesCommon.fillQuery(promise, options);
  const user = await promise.exec();
  throwUserNotFoundIfNeeded(user, options);
  return user;
};
