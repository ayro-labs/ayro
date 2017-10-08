const App = require('../../models').App;
const Device = require('../../models').Device;
const constants = require('../../utils/constants');
const userCommons = require('../commons/user');
const deviceCommons = require('../commons/device');
const integrationCommons = require('../commons/integration');
const uuid = require('uuid').v4;
const chatService = require('.');

exports.postMessage = (data) => {
  return integrationCommons.findIntegration({channel: constants.integration.channels.MESSENGER, 'configuration.page.id': data.recipient.id}).then((integration) => {
    return deviceCommons.findDevices({'info.profile_id': data.sender.id}, {populate: 'user'}).then((devices) => {
      const device = devices.find((device) => {
        return device.user.app === integration.app;
      });
      if (!device) {
        return userCommons.createUser(new App({id: integration.app}), {uid: uuid(), identified: false}).then((user) => {
          return deviceCommons.createDevice(user, {uid: uuid()});
        }).then((device) => {
          return Device.populate(device, 'user');
        });
      }
      return device;
    }).then((device) => {
      return chatService.postMessage(device.user, device, data.message.text);
    });
  });
};
