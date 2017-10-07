const Account = require('../../models').Account;
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const Promise = require('bluebird');

function throwAccountNotFoundIfNeeded(account, options) {
  if (!account && (!options || options.require)) {
    throw errors.notFoundError('account.doesNotExist', 'Account does not exist');
  }
}

exports.getAccount = (id, options) => {
  return Promise.resolve().then(() => {
    const promise = Account.findById(id);
    queries.fillQuery(promise, options);
    return promise.exec();
  }).then((account) => {
    throwAccountNotFoundIfNeeded(account, options);
    return account;
  });
};

exports.findAccount = (query, options) => {
  return Promise.resolve().then(() => {
    const promise = Account.findOne(query);
    queries.fillQuery(promise, options);
    return promise.exec();
  }).then((account) => {
    throwAccountNotFoundIfNeeded(account, options);
    return account;
  });
};
