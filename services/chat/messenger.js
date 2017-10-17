const App = require('../../models').App;
const Device = require('../../models').Device;
const constants = require('../../utils/constants');
const hash = require('../../utils/hash');
const apis = require('../../utils/apis');
const userCommons = require('../commons/user');
const deviceCommons = require('../commons/device');
const integrationCommons = require('../commons/integration');
const chatService = require('.');
const _ = require('lodash');

exports.postMessage = (data) => {
  return Promise.resolve().then(() => {
    if (!data.message.text) {
      return null;
    }
    return integrationCommons.findIntegration({channel: constants.integration.channels.MESSENGER, 'configuration.page.id': data.recipient.id}, {require: false}).bind({}).then((integration) => {
      if (!integration) {
        return null;
      }
      this.integration = integration;
      return deviceCommons.findDevices({'info.profile_id': data.sender.id}, {populate: 'user'});
    }).then((devices) => {
      const device = devices.find((device) => {
        return device.user.app.toString() === this.integration.app.toString();
      });
      if (!device) {
        return apis.facebook(this.integration.configuration, true).api(data.sender.id).then((result) => {
          const userData = {
            first_name: result.first_name,
            last_name: result.last_name,
            uid: hash.uuid(),
            identified: false,
          };
          return userCommons.createUser(new App({id: this.integration.app}), userData).then((user) => {
            const deviceData = {
              uid: hash.uuid(),
              platform: constants.device.platforms.MESSENGER.id,
              info: {
                profile_id: data.sender.id,
                profile_name: user.getFullName(),
                profile_picture: result.profile_pic,
                profile_gender: result.gender ? _.toLower(result.gender) : null,
                profile_locale: result.locale,
                profile_timezone: result.timezone,
              },
            };
            return deviceCommons.createDevice(user, deviceData);
          }).then((device) => {
            return Device.populate(device, 'user');
          });
        });
      }
      return device;
    }).then((device) => {
      return chatService.postMessage(device.user, device, {text: data.message.text});
    });
  });
};
