'use strict';

const {Device} = require('models');
const errors = require('utils/errors');
const queriesCommon = require('utils/queries/common');

function throwDeviceNotFoundIfNeeded(device, options) {
  if (!device && (!options || options.require)) {
    throw errors.notFoundError('device_not_found', 'Device not found');
  }
}

exports.getDevice = async (id, options) => {
  const promise = Device.findById(id);
  queriesCommon.fillQuery(promise, options);
  const device = await promise.exec();
  throwDeviceNotFoundIfNeeded(device, options);
  return device;
};

exports.findDevice = async (query, options) => {
  const promise = Device.findOne(query);
  queriesCommon.fillQuery(promise, options);
  const device = await promise.exec();
  throwDeviceNotFoundIfNeeded(device, options);
  return device;
};

exports.findDevices = async (query, options) => {
  const promise = Device.find(query);
  queriesCommon.fillQuery(promise, options);
  return promise.exec();
};
