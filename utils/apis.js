const settings = require('../configs/settings');
const SlackClient = require('@slack/client').WebClient;
const FB = require('fb');
const _ = require('lodash');

exports.facebook = (configuration, withPageToken) => {
  return new FB.Facebook({
    appId: settings.facebook.appId,
    appSecret: settings.facebook.appSecret,
    accessToken: withPageToken && configuration.page ? configuration.page.access_token : configuration.profile.access_token,
    version: 'v2.10',
  });
};

exports.slack = (configuration) => {
  return new SlackClient(_.isObject(configuration) ? configuration.user.access_token : configuration);
};
