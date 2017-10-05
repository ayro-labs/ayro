const settings = require('../configs/settings');
const FB = require('fb');

exports.facebook = (configuration, withPageToken) => {
  return new FB.Facebook({
    appId: settings.facebook.appId,
    appSecret: settings.facebook.appSecret,
    accessToken: withPageToken && configuration.page ? configuration.page.access_token : configuration.profile.access_token,
    version: 'v2.10',
  });
};
