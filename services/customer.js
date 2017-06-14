'use strict';

let Customer = require('../models').Customer,
    Device   = require('../models').Device,
    errors   = require('../utils/errors'),
    Promise  = require('bluebird'),
    _        = require('lodash'),
    $        = this;

exports.assignCustomerUid = function(userData, deviceData) {
  userData.identified = userData.uid ? true : false;
  userData.uid = userData.uid || deviceData.uid;
};

exports.createCustomer = function(project, data) {
  return Promise.resolve().then(function() {
    if (!data.uid) {
      throw errors.chatzError('customer.uid.required', 'Customer unique id is required');
    }
    let customer = new Customer(data);
    customer.set('project', project);
    customer.set('registration_date', new Date());
    return customer.save();
  });
};

exports.updateCustomer = function(customer, data) {
  return Customer.findByIdAndUpdate(customer._id, data, {new: true});
};

exports.saveCustomer = function(project, data) {
  return $.getCustomer(project, data).then(function(customer) {
    if (!customer) {
      return $.createCustomer(project, data);
    } else {
      return $.updateCustomer(customer, data);
    }
  });
};

exports.getCustomer = function(project, uid) {
  return Customer.findOne({project: project._id, uid: uid}).exec();
};

exports.createDevice = function(customer, data) {
  return Promise.resolve().then(function() {
    let device = new Device(data);
    device.set('customer', customer);
    device.set('registration_date', new Date());
    return device.save();
  });
};

exports.updateDevice = function(device, data) {
  return Device.findByIdAndUpdate(device._id, data, {new: true});
};

exports.saveDevice = function(customer, data) {
  return $.getDevice(customer, data).then(function(customer) {
    if (!device) {
      return $.createDevice(customer, data);
    } else {
      return $.updateDevice(device, data);
    }
  });
};

exports.getDevice = function(customer, uid) {
  return Device.findOne({customer: customer._id, uid: uid}).exec();
};