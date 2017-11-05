const {Account} = require('../models');
const settings = require('../configs/settings');
const hash = require('../utils/hash');
const errors = require('../utils/errors');
const accountCommons = require('./commons/account');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const ACCOUNT_UPDATE = ['name', 'email'];

exports.createAccount = (name, email, password) => {
  return hash.hash(password).then((hash) => {
    const account = new Account({
      name,
      email,
      password: hash,
      registration_date: new Date(),
    });
    return account.save();
  });
};

exports.updateAccount = (account, data) => {
  return Account.findByIdAndUpdate(account.id, _.pick(data, ACCOUNT_UPDATE), {new: true, runValidators: true}).exec();
};

exports.updateAccountLogo = (account, logo) => {
  return Promise.resolve().then(() => {
    const logoName = account.id + path.extname(logo.originalname);
    const logoPath = path.join(settings.accountLogoPath, logoName);
    return new Promise((resolve, reject) => {
      fs.rename(logo.path, logoPath, (err) => {
        if (err) {
          reject(errors.chatzError('account.update.error', 'Error updating account logo', err));
          return;
        }
        resolve(Account.findByIdAndUpdate(account.id, {logo: logoName}, {new: true, runValidators: true}).exec());
      });
    });
  });
};

exports.authenticate = (email, password) => {
  return accountCommons.findAccount({email}).bind({}).then((account) => {
    this.account = account;
    return account ? hash.compare(password, account.password) : false;
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
