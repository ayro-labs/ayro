'use strict';

let integrations = require('.'),
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

let getFallbackText = function(text) {
  let fallback = _.replace(text, /\*/g, '');
  fallback = _.replace(fallback, /\<\#(\w|\d)+\|((\w|\d)+)\>/g, '#$2');
  return fallback;
};

let getUserInformationAttachment = function(user) {
  let information = [];
  let fields = [];
  information.push('App: ' + user.app.name);
  if (user.identified) {
    information.push('ID: ' + user.uid);
  }
  if (!user.name_generated) {
    information.push('Name: ' + user.getFullName());
  }
  if (user.email) {
    information.push('Email: ' + user.email);
  }
  if (user.sign_up_date) {
    information.push('Signed up at: ' + user.sign_up_date);
  }
  if (user.properties) {
    _.each(user.properties, function(value, key) {
      fields.push({title: key, value: value, short: true});
    });
  }
  return {
    fallback: 'User information',
    title: 'User information',
    text: information.join('\n'),
    color: 'good',
    fields: fields
  };
};

let getUserDeviceAttachment = function(user, platform) {
  let information = [];
  let fields = [];
  let device = user.getDevice(platform);
  let deviceInfo = device.info;
  information.push('Platform: ' + device.getPlatformName());
  information.push('App version: ' + device.app_version + ' (' + device.app_id + ')');
  if (deviceInfo) {
    if (device.isSmartphone() && deviceInfo.manufacturer && deviceInfo.model) {
      information.push('Smartphone: ' + _.capitalize(deviceInfo.manufacturer) + ' ' + deviceInfo.model);
    }
    if (device.isSmartphone() && deviceInfo.os_name && deviceInfo.os_version) {
      information.push('OS: ' + deviceInfo.os_name + ' ' + deviceInfo.os_version);
    }
    if (deviceInfo.carrier) {
      information.push('Carrier: ' + deviceInfo.carrier);
    }
  }
  return {
    fallback: 'Device information',
    title: 'Device information',
    text: information.join('\n'),
    color: 'warning',
    fields: fields
  };
};

let createChannelAdvertisingUser = function(slackClient, user, platform, message, supportChannel) {
  return createChannel(slackClient, user).bind({}).tap(function(userChannel) {
    this.userChannel = userChannel;
    return advertiseUser(slackClient, user, platform, message, supportChannel, userChannel);
  }).tap(function() {
    return User.update({_id: user._id}, {extra: _.assign(user.extra || {}, {slack_channel: this.userChannel})}).exec();
  });
};

let createChannel = function(slackClient, user, conflict) {
  return Promise.resolve().then(function() {
    let channel;
    if (!conflict) {
      channel = user.getFullName();
    } else if (conflict === 1) {
      channel = _.truncate(user.getFullName(), {length: 14, omission: ''});
      channel = channel + '-' + user.uid;
    } else {
      channel = user._id;
    }
    channel = _.replace('ch-' + channel, /\s+/g);
    channel = _.truncate(channel, {length: 21, omission: ''});
    channel = _.deburr(channel);
    return slackClient.channels.create(channel);
  }).then(function(result) {
    return {id: result.channel.id, name: result.channel.name};
  }).catch(function(err) {
    if (err.message === 'name_taken') {
      return createChannel(slackClient, user, !conflict ? 1 : ++conflict);
    } else {
      throw err;
    }
  });
};

let advertiseUser = function(slackClient, user, platform, message, supportChannel, userChannel) {
  return Promise.resolve().then(function() {
    let advertiseMessage = '*' + user.getFullName() + '* wants to talk with your team in <#' + userChannel.id + '|' + userChannel.name + '>';
    return slackClient.chat.postMessage(supportChannel.id, advertiseMessage, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: [{
        fallback: getFallbackText(advertiseMessage),
        text: message,
        color: 'good'
      }]
    });
  }).then(function() {
    let advertiseMessage = 'These are all the information we have so far about *' + user.getFullName() + '*';
    return slackClient.chat.postMessage(userChannel.id, advertiseMessage, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: [
        getUserInformationAttachment(user),
        getUserDeviceAttachment(user, platform)
      ]
    });
  });
};

let getChannel = function(slackClient, user) {
  return slackClient.channels.info(user.extra.slack_channel.id).then(function(result) {
    return {
      id: result.channel.id,
      name: result.channel.name,
      archived: result.channel.is_archived
    };
  }).catch(function(err) {
    if (err.message === 'channel_not_found') {
      return null;
    } else {
      throw err;
    }
  });
};

let unarchiveChannelAdvertisingUser = function(slackClient, userChannel, user, platform, message, supportChannel) {
  return slackClient.channels.unarchive(userChannel.id).then(function(result) {
    return advertiseUser(slackClient, user, platform, message, supportChannel, userChannel);
  }).then(function() {
    return userChannel;
  }).catch(function(err) {
    if (err.message === 'not_archived') {
      return userChannel;
    } else {
      throw err;
    }
  });
};

exports.add = function(app, apiToken) {
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
    return integrations.add(app, constants.integration.types.SLACK, constants.integration.channels.BUSINESS, _.pick(configuration, CONFIG_SLACK));
  })
};

exports.update = function(app, configuration)   {
  return integrations.update(app, constants.integration.types.SLACK, _.pick(configuration, CONFIG_SLACK_UPDATE));
};

exports.remove = function(app)   {
  return integrations.remove(app, constants.integration.types.SLACK);
};

exports.listChannels = function(app) {
  return integrations.getConfiguration(app, constants.integration.types.SLACK).then(function(configuration) {
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

exports.createChannel = function(app, channel) {
  return integrations.getConfiguration(app, constants.integration.types.SLACK).then(function(configuration) {
    var slackClient = new SlackClient(configuration.api_token);
    return slackClient.channels.create({name: channel});
  });
};

exports.postMessage = function(user, platform, message) {
  return integrations.getConfiguration(user.app, constants.integration.types.SLACK).bind({}).then(function(configuration) {
    this.slackClient = new SlackClient(configuration.api_token);
    if (user.extra && user.extra.slack_channel) {
      return getChannel(this.slackClient, user).bind(this).then(function(channel) {
        if (!channel) {
          return createChannelAdvertisingUser(this.slackClient, user, platform, message, configuration.channel);
        } else if (channel.archived) {
          return unarchiveChannelAdvertisingUser(this.slackClient, channel, user, platform, message, configuration.channel);
        } else {
          return channel;
        }
      });
    } else {
      return createChannelAdvertisingUser(this.slackClient, user, platform, message, configuration.channel);
    }
  }).then(function(channel) {
    return this.slackClient.chat.postMessage(channel.id, message, {
      username: user.getFullName() + (user.name_generated ? ' (Generated name)' : ''),
      as_user: false
    });
  });
};

exports.pushMessage = function(message) {
  return true;
};