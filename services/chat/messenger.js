const App = require('../../models').App;
const Device = require('../../models').Device;
const constants = require('../../utils/constants');
const hash = require('../../utils/hash');
const userCommons = require('../commons/user');
const deviceCommons = require('../commons/device');
const integrationCommons = require('../commons/integration');
const chatService = require('.');

exports.postMessage = (data) => {
  return integrationCommons.findIntegration({channel: constants.integration.channels.MESSENGER, 'configuration.page.id': data.recipient.id}, {require: false}).then((integration) => {
    if (!integration) {
      return null;
    }
    return deviceCommons.findDevices({'info.profile_id': data.sender.id}, {populate: 'user'}).then((devices) => {
      const device = devices.find((device) => {
        return device.user.app.toString() === integration.app.toString();
      });
      if (!device) {
        const deviceData = {
          uid: hash.uuid(),
          platform: constants.device.platforms.MESSENGER.id,
          info: {
            profile_id: data.sender.id,
          },
        };
        return userCommons.createUser(new App({id: integration.app}), {uid: hash.uuid(), identified: false}).then((user) => {
          return deviceCommons.createDevice(user, deviceData);
        }).then((device) => {
          return Device.populate(device, 'user');
        });
      }
      return device;
    }).then((device) => {
      return chatService.postMessage(device.user, device, {text: data.message.text});
    });
  });
};
