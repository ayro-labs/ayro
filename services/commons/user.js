const {User} = require('../../models');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const Promise = require('bluebird');
const randomName = require('node-random-name');
const _ = require('lodash');

const UNALLOWED_ATTRS = ['_id', 'app', 'generated_name', 'registration_date'];

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
  return Promise.resolve().then(() => {
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
    return user.save();
  });
};

exports.updateUser = (user, data) => {
  return Promise.resolve().then(() => {
    const allowedData = _.omit(data, UNALLOWED_ATTRS);
    if (user.first_name || user.last_name) {
      allowedData.generated_name = false;
    }
    return User.findByIdAndUpdate(user.id, allowedData, {new: true, runValidators: true}).exec();
  });
};
