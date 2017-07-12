const integrations = require('.');
const constants = require('../../utils/constants');
const User = require('../../models').User;
const userCommons = require('../commons/user');
const SlackClient = require('@slack/client').WebClient;
const Promise = require('bluebird');
const _ = require('lodash');

const CHATZ_BOT_USERNAME = 'Chatz Bot';
const CONFIG_SLACK = ['api_token', 'team', 'team_id', 'team_url', 'user', 'user_id', 'channel', 'channel_id'];

function getFallbackText(text) {
  let fallback = _.replace(text, /\*/g, '');
  fallback = _.replace(fallback, /<#(\w|\d)+\|((\w|\d)+)>/g, '#$2');
  return fallback;
}

function getUserAttachment(user) {
  const information = [];
  const fields = [];
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
    _.each(user.properties, (value, key) => {
      fields.push({title: key, value, short: true});
    });
  }
  return {
    fallback: 'User information',
    title: 'User information',
    text: information.join('\n'),
    color: 'good',
    fields,
  };
}

function getDeviceAttachment(device) {
  const information = [];
  const fields = [];
  const deviceInfo = device.info;
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
    fields,
  };
}

function createChannel(slackClient, user, conflict) {
  return Promise.resolve().then(() => {
    let channel;
    if (!conflict) {
      channel = user.getFullName();
    } else if (conflict === 1) {
      channel = _.truncate(user.getFullName(), {length: 14, omission: ''});
      channel = `${channel}-${user.uid}`;
    } else {
      channel = user.id;
    }
    channel = _.replace(`ch-${channel}`, /\s+/g);
    channel = _.truncate(channel, {length: 21, omission: ''});
    channel = _.deburr(channel);
    return slackClient.channels.create(channel);
  }).then((result) => {
    return {id: result.channel.id, name: result.channel.name};
  }).catch((err) => {
    if (err.message === 'name_taken') {
      conflict = conflict ? conflict + 1 : 1;
      return createChannel(slackClient, user, conflict);
    }
    throw err;
  });
}

function advertiseUser(slackClient, user, device, message, supportChannel, userChannel) {
  return Promise.resolve().then(() => {
    const advertiseMessage = `*${user.getFullName()}* wants to talk with your team in <#${userChannel.id}|${userChannel.name}>`;
    return slackClient.chat.postMessage(supportChannel.id, advertiseMessage, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: [{
        fallback: getFallbackText(advertiseMessage),
        text: message,
        color: 'good',
      }],
    });
  }).then(() => {
    const advertiseMessage = `These are all the information we have so far about *${user.getFullName()}*`;
    return slackClient.chat.postMessage(userChannel.id, advertiseMessage, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: [getUserAttachment(user), getDeviceAttachment(device)],
    });
  });
}

function createChannelAdvertisingUser(slackClient, user, device, message, supportChannel) {
  return createChannel(slackClient, user).bind({}).tap((userChannel) => {
    this.userChannel = userChannel;
    return advertiseUser(slackClient, user, device, message, supportChannel, userChannel);
  }).tap(() => {
    return User.update({_id: user.id}, {extra: _.assign(user.extra || {}, {slack_channel: this.userChannel})}).exec();
  });
}

function getChannel(slackClient, user) {
  return slackClient.channels.info(user.extra.slack_channel.id).then((result) => {
    return {
      id: result.channel.id,
      name: result.channel.name,
      archived: result.channel.is_archived,
    };
  }).catch((err) => {
    if (err.message === 'channel_not_found') {
      return null;
    }
    throw err;
  });
}

function unarchiveChannelAdvertisingUser(slackClient, userChannel, user, device, message, supportChannel) {
  return slackClient.channels.unarchive(userChannel.id).then(() => {
    return advertiseUser(slackClient, user, device, message, supportChannel, userChannel);
  }).then(() => {
    return userChannel;
  }).catch((err) => {
    if (err.message === 'not_archived') {
      return userChannel;
    }
    throw err;
  });
}

exports.add = (app, apiToken) => {
  return Promise.resolve().bind({}).then(() => {
    this.slackClient = new SlackClient(apiToken);
    return this.slackClient.auth.test();
  }).then((result) => {
    this.configuration = {
      api_token: apiToken,
      team: {id: result.team_id, name: result.team, url: result.url},
      user: {id: result.user_id, name: result.user},
    };
    return this.slackClient.channels.list({exclude_archived: true, exclude_members: true});
  }).then((result) => {
    const configuration = this.configuration;
    _.each(result.channels, (channel) => {
      if (channel.is_general) {
        configuration.channel = {id: channel.id, name: channel.name};
      }
    });
    return integrations.add(app, constants.integration.types.SLACK, constants.integration.channels.BUSINESS, _.pick(configuration, CONFIG_SLACK));
  });
};

exports.listChannels = (app) => {
  return integrations.getConfiguration(app, constants.integration.types.SLACK).then((configuration) => {
    const slackClient = new SlackClient(configuration.api_token);
    return slackClient.channels.list({exclude_archived: true, exclude_members: true});
  }).then((result) => {
    const channels = [];
    _.each(result.channels, (channel) => {
      channels.push({id: channel.id, name: channel.name});
    });
    return channels;
  });
};

exports.createChannel = (app, channel) => {
  return integrations.getConfiguration(app, constants.integration.types.SLACK).then((configuration) => {
    const slackClient = new SlackClient(configuration.api_token);
    return slackClient.channels.create({name: channel});
  });
};

exports.postMessage = (user, device, configuration, message) => {
  return Promise.resolve().bind({}).then(() => {
    this.slackClient = new SlackClient(configuration.api_token);
    if (user.extra && user.extra.slack_channel) {
      return getChannel(this.slackClient, user).bind(this).then((channel) => {
        if (!channel) {
          return createChannelAdvertisingUser(this.slackClient, user, device, message, configuration.channel);
        } else if (channel.archived) {
          return unarchiveChannelAdvertisingUser(this.slackClient, channel, user, device, message, configuration.channel);
        }
        return channel;
      });
    }
    return createChannelAdvertisingUser(this.slackClient, user, device, message, configuration.channel);
  }).then((channel) => {
    return this.slackClient.chat.postMessage(channel.id, message, {
      username: user.getFullName() + (user.name_generated ? ' (Generated name)' : ''),
      as_user: false,
    });
  });
};

exports.extractUser = (data) => {
  return userCommons.findUser({'extra.slack_channel.id': data.channel_id}, {require: true});
};

exports.extractAuthor = (data, integration) => {
  return Promise.resolve().then(() => {
    const slackClient = new SlackClient(integration.configuration.api_token);
    return slackClient.users.info(data.user_id);
  }).then((result) => {
    return {
      id: data.user_id,
      name: result.user.profile.real_name,
      photo_url: result.user.profile.image_192,
    };
  });
};

exports.extractText = (data) => {
  return Promise.resolve(data.text);
};

exports.confirmMessage = (data, integration, chatMessage) => {
  return Promise.resolve().then(() => {
    const slackClient = new SlackClient(integration.configuration.api_token);
    return slackClient.chat.postMessage(data.channel_id, chatMessage.text, {
      username: chatMessage.author.name,
      as_user: false,
    });
  });
};
