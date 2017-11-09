const userCommons = require('./commons/user');
const Promise = require('bluebird');

exports.saveUser = (app, data) => {
  return Promise.coroutine(function* () {
    const user = yield userCommons.findUser({app: app.id, uid: data.uid}, {require: false});
    return !user ? userCommons.createUser(app, data) : userCommons.updateUser(user, data);
  })();
};

exports.updateUser = (user, data) => {
  return userCommons.updateUser(user, data);
};
