'use strict';

const userQueries = require('../utils/queries/user');
const deviceQueries = require('../utils/queries/device');
const deviceCommons = require('./commons/device');
const _ = require('lodash');

async function removeChannelFromOldDevice(user, channel, data) {
  const device = await deviceQueries.findDevice({user: user.id, channels: channel}, {require: false});
  if (device && device.uid !== data.uid) {
    const channels = _.without(device.channels, channel);
    if (_.isEmpty(channels)) {
      await device.remove();
    } else {
      await device.update({channels}, {runValidators: true});
    }
  }
}

exports.saveDevice = async (user, channel, data) => {
  const attrs = _.cloneDeep(data);
  const loadedUser = await userQueries.getUser(user.id);
  await removeChannelFromOldDevice(user, channel, attrs);
  let device = await deviceQueries.findDevice({user: loadedUser.id, uid: attrs.uid}, {require: false});
  if (!device) {
    attrs.channels = [channel];
    device = await deviceCommons.createDevice(loadedUser, attrs);
  } else {
    const channels = new Set(device.channels);
    channels.add(channel);
    attrs.channels = Array.from(channels);
    device = await deviceCommons.updateDevice(device, attrs);
  }
  return device;
};

exports.updateDevice = async (device, data) => {
  return deviceCommons.updateDevice(device, data);
};

exports.getDevice = async (id) => {
  return deviceQueries.getDevice(id);
};
