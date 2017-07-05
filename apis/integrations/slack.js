'use strict';

let integrations = require('.'),
    constants = require('../../utils/constants'),
    User = require('../../models').User,
    userCommons = require('../commons/user'),
    push = require('./push'),
    SlackClient = require('@slack/client').WebClient,
    Promise = require('bluebird'),
    _ = require('lodash');

const EVENT_CHAT_MESSAGE = 'chat_message';

const CHATZ_BOT_USERNAME = 'Chatz Bot'
const CONFIG_SLACK = ['api_token', 'team', 'team_id', 'team_url', 'user', 'user_id', 'channel', 'channel_id'];
const CONFIG_SLACK_UPDATE = ['channel', 'channel_id'];

let getFallbackText = function(text) {
  let fallback = _.replace(text, /\*/g, '');
  fallback = _.replace(fallback, /\<\#(\w|\d)+\|((\w|\d)+)\>/g, '#$2');
  return fallback;
};

let getUserAttachment = function(user) {
  let information = [];
  let fields = [];
  information.push(`App: ${user.app.name}`);
  if (user.identified) {
    information.push(`ID: ${user.uid}`);
  }
  if (!user.name_generated) {
    information.push(`Name: ${user.getFullName()}`);
  }
  if (user.email) {
    information.push(`Email: ${user.email}`);
  }
  if (user.sign_up_date) {
    information.push(`Signed up at: ${user.sign_up_date}`);
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

let getDeviceAttachment = function(device) {
  let information = [];
  let fields = [];
  let deviceInfo = device.info;
  information.push(`Platform: ${device.getPlatformName()}`);
  if (deviceInfo) {
    if (device.isSmartphone()) {
      if (deviceInfo.app_id && deviceInfo.app_version) {
        information.push(`App version: ${deviceInfo.app_version} (${deviceInfo.app_id})`);
      }
      if (deviceInfo.os_name && deviceInfo.os_version) {
        information.push(`OS: ${deviceInfo.os_name} ${deviceInfo.os_version}`);
      }
      if (deviceInfo.manufacturer && deviceInfo.model) {
        information.push(`Smartphone: ${_.capitalize(deviceInfo.manufacturer)} ${deviceInfo.model}`);
      }
      if (deviceInfo.carrier) {
        information.push(`Carrier: ${deviceInfo.carrier}`);
      }
    }
    if (device.isWeb()) {
      if (deviceInfo.browser_name && deviceInfo.browser_version) {
        information.push(`Browser: ${deviceInfo.browser_name} ${deviceInfo.browser_version}`);
      }
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

let createChannelAdvertisingUser = function(slackClient, user, device, message, supportChannel) {
  return createChannel(slackClient, user).bind({}).tap(function(userChannel) {
    this.userChannel = userChannel;
    return advertiseUser(slackClient, user, device, message, supportChannel, userChannel);
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

let advertiseUser = function(slackClient, user, device, message, supportChannel, userChannel) {
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
      attachments: [getUserAttachment(user), getDeviceAttachment(device)]
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

let unarchiveChannelAdvertisingUser = function(slackClient, userChannel, user, device, message, supportChannel) {
  return slackClient.channels.unarchive(userChannel.id).then(function(result) {
    return advertiseUser(slackClient, user, device, message, supportChannel, userChannel);
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
  return Promise.resolve().bind({}).then(function() {
    this.slackClient = new SlackClient(apiToken);
    return this.slackClient.auth.test();
  }).then(function(result) {
    this.configuration = {
      api_token: apiToken,
      team: {id: result.team_id, name: result.team, url: result.url},
      user: {id: result.user_id, name: result.user}
    };
    return this.slackClient.channels.list({exclude_archived: true, exclude_members: true});
  }).then(function(result) {
    let configuration = this.configuration;
    let channels = [];
    _.each(result.channels, function(channel) {
      if (channel.is_general) {
        configuration.channel = {id: channel.id, name: channel.name};
      }
    });
    return integrations.add(app, constants.integration.types.SLACK, constants.integration.channels.BUSINESS, _.pick(configuration, CONFIG_SLACK));
  });
};

exports.listChannels = function(app) {
  return integrations.getConfiguration(app, constants.integration.types.SLACK).then(function(configuration) {
    let slackClient = new SlackClient(configuration.api_token);
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
    let slackClient = new SlackClient(configuration.api_token);
    return slackClient.channels.create({name: channel});
  });
};

exports.postMessage = function(user, device, configuration, message) {
  return Promise.resolve().bind({}).then(function() {
    this.slackClient = new SlackClient(configuration.api_token);
    if (user.extra && user.extra.slack_channel) {
      return getChannel(this.slackClient, user).bind(this).then(function(channel) {
        if (!channel) {
          return createChannelAdvertisingUser(this.slackClient, user, device, message, configuration.channel);
        } else if (channel.archived) {
          return unarchiveChannelAdvertisingUser(this.slackClient, channel, user, device, message, configuration.channel);
        } else {
          return channel;
        }
      });
    } else {
      return createChannelAdvertisingUser(this.slackClient, user, device, message, configuration.channel);
    }
  }).then(function(channel) {
    return this.slackClient.chat.postMessage(channel.id, message, {
      username: user.getFullName() + (user.name_generated ? ' (Generated name)' : ''),
      as_user: false
    });
  });
};

exports.pushMessage = function(data) {
  return userCommons.findUser({'extra.slack_channel.id': data.channel_id}, {populate: 'app latest_device'}).bind({}).then(function(user) {
    let integration = user.app.getIntegration(constants.integration.types.SLACK);
    if (!integration) {
      return;
    }
    this.user = user;
    this.slackClient = new SlackClient(integration.configuration.api_token);
    return this.slackClient.users.info(data.user_id);
  }).then(function(result) {
    this.message = {
      author: {
        id: data.user_id,
        name: result.user.profile.real_name,
        photo: result.user.profile.image_192
      },
      text: data.text,
      date: new Date()
    };
    return push.message(this.user, EVENT_CHAT_MESSAGE, this.message);
  }).then(function() {
    return this.slackClient.chat.postMessage(data.channel_id, this.message.text, {
      username: this.message.author.name,
      as_user: false
    });
  });
};