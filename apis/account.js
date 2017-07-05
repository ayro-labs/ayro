'use strict';

let Account = require('../models').Account,
    AccountSecretKey = require('../models').AccountSecretKey,
    cryptography = require('../utils/cryptography'),
    Promise = require('bluebird');

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
    return account ? cryptography.compare(password, account.password) : false;
  }).then(function(equals) {
    return equals ? this.account : null;
  });
};