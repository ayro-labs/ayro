'use strict';

let integrations = require('.'),
    userCommons = require('../commons/user'),
    constants = require('../../utils/constants'),
    User = require('../../models').User,
    SlackClient = require('@slack/client').WebClient,
    Promise = require('bluebird'),
    _ = require('lodash');

const CHATZ_BOT_USERNAME = 'Chatz Bot'
const CONFIG_SLACK = ['api_token', 'team', 'team_id', 'team_url', 'user', 'user_id', 'channel', 'channel_id'];
const CONFIG_SLACK_UPDATE = ['channel', 'channel_id'];

let checkAuthentication = function(apiToken) {
  return Promise.resolve().then(function() {
    var slackClient = new SlackClient(apiToken);
    return slackClient.auth.test();
  });
};

let createChannelAdvertisingUser = function(slackClient, user, message, supportChannel) {
  return createChannel(slackClient, user).bind({}).tap(function(userChannel) {
    this.userChannel = userChannel;
    return advertiseUser(slackClient, user, message, supportChannel, userChannel);
  }).tap(function() {
    return User.update({_id: user._id}, {extra: _.assign(user.extra || {}, {slack_channel: this.userChannel})}).exec();
  });
};

let createChannel = function(slackClient, user) {
  return Promise.resolve().then(function() {
    let channel = _.kebabCase('ch-' + user.full_name);
    channel = _.truncate(channel, {length: 21});
    channel = _.lowerCase(channel);
    channel = _.deburr(channel);
    return slackClient.channels.create(channel);
  }).then(function(result) {
    return {id: result.channel.id, name: result.channel.name};
  }).catch(function(err) {
    if (err.message === 'name_taken') {
      return null;
    } else {
      throw err;
    }
  });
};

let advertiseUser = function(slackClient, user, message, supportChannel, userChannel) {
  return Promise.resolve().then(function() {
    let advertiseMessage = '*' + user.full_name + '* wants to talk with your team in <#' + userChannel.id + '|' + userChannel.name + '>';
    return slackClient.chat.postMessage(supportChannel.id, advertiseMessage, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: [{
        fallback: advertiseMessage,
        text: message,
        color: 'good'
      }]
    });
  });
};

let getChannel = function(slackClient, user) {
  return slackClient.channels.info(user.extra.slack_channel.id).then(function(result) {
    let channel = {id: result.channel.id, name: result.channel.name};
    return !result.channel.is_archived ? channel : unarchiveChannel(slackClient, channel);
  }).catch(function(err) {
    console.log("C")
    if (err.message === 'channel_not_found') {
      return null;
    } else {
      throw err;
    }
  }).catch(function(err) {
    console.log(typeof err)
    console.log("D")
  });
};

let unarchiveChannel = function(slackClient, channel) {
  return slackClient.channels.unarchive(channel.id).then(function(result) {
    return channel;
  }).catch(function(err) {
    if (err.message === 'not_archived') {
      return channel;
    } else {
      throw err;
    }
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
  return userCommons.getUser(user._id, 'project').bind({}).then(function(user) {
    this.user = user;
    return integrations.getConfiguration(user.project, constants.integrationTypes.SLACK);
  }).then(function(configuration) {
    this.slackClient = new SlackClient(configuration.api_token);
    if (this.user.extra && this.user.extra.slack_channel) {
      console.log("A")
      return getChannel(this.slackClient, this.user).bind(this).then(function(channel) {
        console.log("B")
        console.log(channel)
        return channel || createChannelAdvertisingUser(this.slackClient, this.user, message, configuration.channel);
      });
    } else {
      return createChannelAdvertisingUser(this.slackClient, this.user, message, configuration.channel);
    }
  }).then(function(channel) {
    return this.slackClient.chat.postMessage(channel.id, message, {
      username: this.user.full_name,
      as_user: false
    });
  });
};