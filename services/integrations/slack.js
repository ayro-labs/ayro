'use strict';

let integrations = require('.'),
    userCommons = require('../commons/user'),
    constants = require('../../utils/constants'),
    Promise = require('bluebird'),
    _ = require('lodash');

const CONFIG_SLACK = ['api_token', 'team', 'team_id', 'team_url', 'user', 'user_id', 'channel', 'channel_id'];
const CONFIG_SLACK_UPDATE = ['channel', 'channel_id'];

let SlackClient = Promise.promisifyAll(require('@slack/client').WebClient);

let checkAuthentication = function(apiToken) {
  return Promise.resolve().then(function() {
    var slackClient = new SlackClient(apiToken);
    return slackClient.auth.test();
  });
};

exports.add = function(project, apiToken) {
  return checkAuthentication(apiToken).bind({}).then(function(authentication) {
    this.configuration = {
      api_token: apiToken,
      team: {id: authentication.team_id, name: authentication.team, url: authentication.url},
      user: {id: authentication.user_id, name: authentication.user}
    };
    var slackClient = new SlackClient(apiToken);
    return slackClient.channels.list({exclude_archived: true, exclude_members: true});
  }).then(function(result) {
    let configuration = this.configuration;
    let channels = [];
    _.each(result.channels, function(channel) {
      if (channel.is_general) {
        configuration.channel = {id: channel.id, name: channel.name};
      }
    });
    return integrations.add(project, constants.integrationTypes.SLACK, constants.channels.BUSINESS, _.pick(configuration, CONFIG_SLACK));
  })
};

exports.update = function(project, configuration)   {
  return integrations.update(project, constants.integrationTypes.SLACK, _.pick(configuration, CONFIG_SLACK_UPDATE));
};

exports.remove = function(project)   {
  return integrations.remove(project, constants.integrationTypes.SLACK);
};

exports.listChannels = function(project) {
  return integrations.getConfiguration(project, constants.integrationTypes.SLACK).then(function(configuration) {
    var slackClient = new SlackClient(configuration.api_token);
    return slackClient.channels.list({exclude_archived: true, exclude_members: true});
  }).then(function(result) {
    let channels = [];
    _.each(result.channels, function(channel) {
      channels.push({id: channel.id, name: channel.name});
    });
    return channels;
  });
};

exports.createChannel = function(project, channel) {
  return integrations.getConfiguration(project, constants.integrationTypes.SLACK).then(function(configuration) {
    var slackClient = new SlackClient(configuration.api_token);
    return slackClient.channels.create({name: channel});
  });
};

exports.postMessage = function(user, message) {
  return userCommons.getUser(user._id, 'project').then(function(user) {
    return integrations.getConfiguration(user.project, constants.integrationTypes.SLACK).then(function(configuration) {
      var slackClient = new SlackClient(configuration.api_token);
      return slackClient.chat.postMessage({
        channel: configuration.channel.id,
        username: user.full_name,
        text, message,
        as_user: false
      });
    });
  });
};