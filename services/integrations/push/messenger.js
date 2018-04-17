const apis = require('../../../utils/apis');

exports.push = async (configuration, user, device, event, message) => {
  if (!device.info || !device.info.profile_id || !configuration.page) {
    return;
  }
  const data = {
    recipient: {
      id: device.info.profile_id,
    },
    message: {
      text: message.text,
    },
  };
  await apis.facebook(configuration, true).api('me/messages', 'post', data);
};
