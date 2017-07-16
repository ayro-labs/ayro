const Account = require('../models').Account;
const cryptography = require('../utils/cryptography');
const errors = require('../utils/errors');
const accountCommons = require('./commons/account');

exports.createAccount = (name, email, password) => {
  return cryptography.hash(password).then((hash) => {
    const account = new Account({
      name,
      email,
      password: hash,
      registration_date: new Date(),
    });
    return account.save();
  });
};

exports.authenticate = (email, password) => {
  return Account.findOne({email}).exec().bind({}).then((account) => {
    if (!account) {
      throw errors.chatzError('account.doesNotExist', 'Account does not exist');
    }
    this.account = account;
    return account ? cryptography.compare(password, account.password) : false;
  }).then((equals) => {
    if (!equals) {
      throw errors.chatzError('account.auth.wrongPassword', 'Wrong account password');
    }
    return this.account;
  });
};

exports.getAccount = (id) => {
  return accountCommons.getAccount(id);
};
