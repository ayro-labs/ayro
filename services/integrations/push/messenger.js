const apis = require('../../../utils/apis');
const Promise = require('bluebird');

exports.push = (configuration, user, device, event, message) => {
  return Promise.coroutine(function* () {
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
    yield apis.facebook(configuration, true).api('me/messages', 'post', data);
  })();
};
