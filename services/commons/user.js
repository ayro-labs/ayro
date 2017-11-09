const {User} = require('../../models');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const Promise = require('bluebird');
const randomName = require('node-random-name');
const _ = require('lodash');

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
    delete data._id;
    const user = new User(data);
    user.app = app.id;
    user.registration_date = new Date();
    if (!user.first_name && !user.last_name) {
      [user.first_name, user.last_name] = _.split(randomName(), ' ');
    }
    return user.save();
  });
};

exports.updateUser = (user, data) => {
  return Promise.resolve().then(() => {
    delete data._id;
    return User.findByIdAndUpdate(user.id, data, {new: true, runValidators: true}).exec();
  });
};
