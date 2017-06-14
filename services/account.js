'use strict';

let Account          = require('../models').Account,
    AccountSecretKey = require('../models').AccountSecretKey,
    cryptography     = require('../utils/cryptography'),
    Promise          = require('bluebird');

exports.createAccount = function(firstName, lastName, email, password) {
  return cryptography.hash(password).then(function(hash) {
  	let account = new Account({
  		first_name: firstName,
      last_name: lastName,
      email: email,
      password: hash,
      registration_date: new Date()
  	});
    return account.save();
  });
};

exports.authenticate = function(email, password) {
  return Account.findOne({email: email}).exec().bind({}).then(function(account) {
    this.account = account;
    if (account) {
      return cryptography.compare(password, account.get('password'));
    }
  }).then(function(equals) {
    return equals ? this.account : null;
  });
};

exports.createSecretKey = function(account) {
  return keys.generate().then(function(secret) {
    let secretKey = new AccountSecretKey({
      account: account._id,
      secret: secret,
      registration_date: new Date()
    });
    return secretKey.save();
  });
};

exports.removeSecretKey = function(account, secretKey) {
  return AccountSecretKey.findByIdAndRemove(secretKey._id).exec();
};