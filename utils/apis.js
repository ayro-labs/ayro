const settings = require('../configs/settings');
const SlackClient = require('@slack/client').WebClient;
const FB = require('fb');
const Twitter = require('twitter');
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


exports.twitter = (configuration) => {
  return new Twitter({
    consumer_key: settings.twitter.consumerKey,
    consumer_secret: settings.twitter.consumerSecret,
    access_token_key: settings.twitter.accessTokenKey,
    access_token_secret: settings.twitter.accessTokenSecret,
  });
};


var request = require('request')


// twitter authentication
var twitter_oauth = {
  consumer_key: settings.twitter.consumerKey,
  consumer_secret: settings.twitter.consumerSecret,
  token: settings.twitter.accessTokenKey,
  token_secret: settings.twitter.accessTokenSecret,
}

var WEBHOOK_URL = 'https://api.ayro.io/chat/twitter'


// request options
var request_options = {
  url: 'https://api.twitter.com/1.1/account_activity/webhooks.json',
  oauth: twitter_oauth,
  headers: {
    'Content-type': 'application/x-www-form-urlencoded'
  },
  form: {
    url: WEBHOOK_URL
  }
}

// POST request to create webhook config
request.post(request_options, function (error, response, body) {
  console.log(body)
})