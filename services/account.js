'use strict';

const {Account} = require('models');
const hash = require('utils/hash');
const files = require('utils/files');
const errors = require('utils/errors');
const accountQueries = require('utils/queries/account');
const _ = require('lodash');

const ALLOWED_ATTRS = ['name', 'email'];

exports.getAccount = async (id) => {
  return accountQueries.getAccount(id);
};

exports.createAccount = async (name, email, password) => {
  const accountWithEmail = await accountQueries.findAccount({email}, {require: false});
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
  const loadedAccount = await accountQueries.getAccount(account.id);
  const attrs = _.pick(data, ALLOWED_ATTRS);
  await loadedAccount.update(attrs, {runValidators: true});
  loadedAccount.set(attrs);
  return loadedAccount;
};

exports.updateLogo = async (account, logoFile) => {
  const loadedAccount = await accountQueries.getAccount(account.id);
  const logo = await files.uploadAccountLogo(loadedAccount, logoFile.path);
  await loadedAccount.update({logo}, {runValidators: true});
  loadedAccount.logo = logo;
  return loadedAccount;
};

exports.authenticate = async (email, password) => {
  const account = await accountQueries.findAccount({email});
  const match = await hash.compare(password, account.password);
  if (!match) {
    throw errors.ayroError('wrong_password', 'Wrong account password');
  }
  return account;
};
