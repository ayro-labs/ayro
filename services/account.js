const Account = require('../models').Account;
const cryptography = require('../utils/cryptography');

exports.createAccount = (firstName, lastName, email, password) => {
  return cryptography.hash(password).then((hash) => {
    const account = new Account({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hash,
      registration_date: new Date(),
    });
    return account.save();
  });
};

exports.authenticate = (email, password) => {
  return Account.findOne({email}).exec().bind({}).then((account) => {
    this.account = account;
    return account ? cryptography.compare(password, account.password) : false;
  }).then((equals) => {
    return equals ? this.account : null;
  });
};
