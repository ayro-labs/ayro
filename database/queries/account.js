'use strict';

const {Account} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');

function throwAccountNotFoundIfNeeded(account, options) {
  if (!account && (!options || options.require)) {
    throw errors.notFoundError('account_not_found', 'Account not found');
  }
}

exports.getAccount = async (id, options) => {
  const promise = Account.findById(id);
  queryCommon.fillQuery(promise, options);
  const account = await promise.exec();
  throwAccountNotFoundIfNeeded(account, options);
  return account;
};

exports.findAccount = async (query, options) => {
  const promise = Account.findOne(query);
  queryCommon.fillQuery(promise, options);
  const account = await promise.exec();
  throwAccountNotFoundIfNeeded(account, options);
  return account;
};
