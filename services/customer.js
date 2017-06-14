'use strict';

let Customer = require('../models').Customer,
    Promise  = require('bluebird'),
    _        = require('lodash'),
    $        = this;

exports.getCustomer = function(project, user, device) {
  return Promise.resolve().then(function() {
    return Customer.findOne({uid: user.uid || device.uid, project: project._id}).exec();
  });
};

exports.createCustomer = function(project, user, device) {
  return Promise.resolve().then(function() {
    let customer = new Customer(user);
    customer.set('project', project._id);
    customer.set('uid', user.uid || device.uid);
    customer.set('identified', user.uid ? true : false);
    customer.set('registration_date', new Date());
    device.registration_date = new Date();
    customer.devices.push(device);
    return customer.save();
  });
};

exports.updateCustomer = function(customer, user, device) {
  return Promise.resolve().then(function() {
    _.forIn(user, function(value, key) {
      customer.set(key, value);
    });
    customer.set('uid', user.uid || device.uid);
    customer.set('identified', user.uid ? true : false);
    return customer.save();
  });
};

exports.saveCustomer = function(project, user, device) {
  return $.getCustomer(project, user, device).then(function(customer) {
    if (!customer) {
      return $.createCustomer(project, user, device);
    } else {
      return $.updateCustomer(customer, user, device);
    }
  });
};