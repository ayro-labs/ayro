const {Account} = require('../models');
const settings = require('../configs/settings');
const logger = require('../utils/logger');
const hash = require('../utils/hash');
const files = require('../utils/files');
const errors = require('../utils/errors');
const accountCommons = require('./commons/account');
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const _ = require('lodash');

const $ = this;

const ALLOWED_ATTRS = ['name', 'email'];

const renameAsync = Promise.promisify(fs.rename);

exports.getAccount = (id) => {
  return accountCommons.getAccount(id);
};

exports.createAccount = (name, email, password) => {
  return Promise.coroutine(function* () {
    const passHash = yield hash.hash(password);
    const account = new Account({name, email, password: passHash, registration_date: new Date()});
    return account.save();
  })();
};

exports.updateAccount = (account, data) => {
  return Account.findByIdAndUpdate(account.id, _.pick(data, ALLOWED_ATTRS), {new: true, runValidators: true}).exec();
};

exports.updateLogo = (account, logo) => {
  return Promise.coroutine(function* () {
    const currentAccount = yield $.getAccount(account.id);
    const logoPath = path.join(settings.accountLogoPath, currentAccount.id);
    yield renameAsync(logo.path, logoPath);
    try {
      currentAccount.logo = currentAccount.id;
      currentAccount.logo = yield files.fixAccountLogo(currentAccount);
    } catch (err) {
      logger.debug('Could not fix logo of account %s: %s.', currentAccount.id, err.message);
    }
    return Account.findByIdAndUpdate(currentAccount.id, {logo: currentAccount.logo}, {new: true, runValidators: true}).exec();
  })();
};

exports.authenticate = (email, password) => {
  return Promise.coroutine(function* () {
    const account = yield accountCommons.findAccount({email});
    const match = yield hash.compare(password, account.password);
    if (!match) {
      throw errors.ayroError('account.auth.wrongPassword', 'Wrong account password');
    }
    return account;
  })();
};
