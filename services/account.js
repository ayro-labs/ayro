const {Account} = require('../models');
const settings = require('../configs/settings');
const hash = require('../utils/hash');
const errors = require('../utils/errors');
const accountCommons = require('./commons/account');
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const _ = require('lodash');

const renameAsync = Promise.promisify(fs.rename);

const ACCOUNT_UPDATE = ['name', 'email'];

exports.getAccount = (id) => {
  return accountCommons.getAccount(id);
};

exports.createAccount = (name, email, password) => {
  return Promise.coroutine(function* () {
    const passwordHash = yield hash.hash(password);
    const account = new Account({name, email, password: passwordHash, registration_date: new Date()});
    return account.save();
  })();
};

exports.updateAccount = (account, data) => {
  return Account.findByIdAndUpdate(account.id, _.pick(data, ACCOUNT_UPDATE), {new: true, runValidators: true}).exec();
};

exports.updateLogo = (account, logo) => {
  return Promise.coroutine(function* () {
    const logoName = account.id + path.extname(logo.originalname);
    const logoPath = path.join(settings.accountLogoPath, logoName);
    yield renameAsync(logo.path, logoPath);
    return Account.findByIdAndUpdate(account.id, {logo: logoName}, {new: true, runValidators: true}).exec();
  })();
};

exports.authenticate = (email, password) => {
  return Promise.coroutine(function* () {
    const account = yield accountCommons.findAccount({email});
    const match = yield hash.compare(password, account.password);
    if (!match) {
      throw errors.chatzError('account.auth.wrongPassword', 'Wrong account password');
    }
    return account;
  })();
};
