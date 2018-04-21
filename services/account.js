'use strict';

const {Account} = require('../models');
const settings = require('../configs/settings');
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

const unlinkAsync = Promise.promisify(fs.unlink);

exports.getAccount = async (id) => {
  return accountCommons.getAccount(id);
};

exports.createAccount = async (name, email, password) => {
  const accountWithEmail = await accountCommons.findAccount({email}, {require: false});
  if (accountWithEmail) {
    throw errors.ayroError('account_already_exists', 'Account already exists');
  }
  const passHash = await hash.hash(password);
  const account = new Account({
    name,
    email,
    password: passHash,
    registration_date: new Date(),
  });
  return account.save();
};

exports.updateAccount = async (account, data) => {
  return Account.findByIdAndUpdate(account.id, _.pick(data, ALLOWED_ATTRS), {new: true, runValidators: true}).exec();
};

exports.updateLogo = async (account, logo) => {
  const loadedAccount = await $.getAccount(account.id);
  const oldLogoPath = loadedAccount.logo ? path.join(settings.accountLogoPath, loadedAccount.logo) : null;
  loadedAccount.logo = await files.fixAccountLogo(loadedAccount, logo.path);
  if (oldLogoPath) {
    await unlinkAsync(oldLogoPath);
  }
  return Account.findByIdAndUpdate(loadedAccount.id, {logo: loadedAccount.logo}, {new: true, runValidators: true}).exec();
};

exports.authenticate = async (email, password) => {
  const account = await accountCommons.findAccount({email});
  const match = await hash.compare(password, account.password);
  if (!match) {
    throw errors.ayroError('wrong_password', 'Wrong account password');
  }
  return account;
};
