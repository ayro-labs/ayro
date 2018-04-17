const userCommons = require('./commons/user');

exports.saveUser = async (app, data) => {
  const user = await userCommons.findUser({app: app.id, uid: data.uid}, {require: false});
  return !user ? userCommons.createUser(app, data) : userCommons.updateUser(user, data);
};

exports.updateUser = async (user, data) => {
  return userCommons.updateUser(user, data);
};
