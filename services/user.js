const userCommons = require('./commons/user');

exports.saveUser = (app, data) => {
  return userCommons.findUser({app: app.id, uid: data.uid}, {require: false}).then((user) => {
    if (!user) {
      return userCommons.createUser(app, data);
    }
    return userCommons.updateUser(user, data);
  });
};

exports.updateUser = (user, data) => {
  return userCommons.updateUser(user, data);
};
