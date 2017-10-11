const User = require('../../models').User;
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
  return Promise.resolve().then(() => {
    const promise = User.findById(id);
    queries.fillQuery(promise, options);
    return promise.exec();
  }).then((user) => {
    throwUserNotFoundIfNeeded(user, options);
    return user;
  });
};

exports.findUser = (query, options) => {
  return Promise.resolve().then(() => {
    const promise = User.findOne(query);
    queries.fillQuery(promise, options);
    return promise.exec();
  }).then((user) => {
    throwUserNotFoundIfNeeded(user, options);
    return user;
  });
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
      const names = _.split(randomName(), ' ');
      user.first_name = names[0];
      user.last_name = names[1];
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
