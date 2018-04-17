const {Account} = require('../../models');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');

function throwAccountNotFoundIfNeeded(account, options) {
  if (!account && (!options || options.require)) {
    throw errors.notFoundError('account.doesNotExist', 'Account does not exist');
  }
}

exports.getAccount = async (id, options) => {
  const promise = Account.findById(id);
  queries.fillQuery(promise, options);
  const account = await promise.exec();
  throwAccountNotFoundIfNeeded(account, options);
  return account;
};

exports.findAccount = async (query, options) => {
  const promise = Account.findOne(query);
  queries.fillQuery(promise, options);
  const account = await promise.exec();
  throwAccountNotFoundIfNeeded(account, options);
  return account;
};
