const Account = require('../../models').Account;
const errors = require('../../utils/errors');
const Promise = require('bluebird');
const _ = require('lodash');

function fillQuery(promise, options) {
  if (options) {
    if (!_.has(options, 'require')) {
      options.require = true;
    }
    if (options.populate) {
      promise.populate(options.populate);
    }
    if (options.lean) {
      promise.lean();
    }
  }
}

function throwAccountNotFoundIfNeeded(account, options) {
  if (!account && (!options || options.require)) {
    throw errors.notFoundError('account.doesNotExist', 'Account does not exist');
  }
}

exports.getAccount = (id, options) => {
  return Promise.resolve().then(() => {
    const promise = Account.findById(id);
    fillQuery(promise, options);
    return promise.exec();
  }).then((account) => {
    throwAccountNotFoundIfNeeded(account, options);
    return account;
  });
};
