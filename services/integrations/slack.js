const integrations = require('.');
const constants = require('../../utils/constants');
const User = require('../../models').User;
const userCommons = require('../commons/user');
const SlackClient = require('@slack/client').WebClient;
const Promise = require('bluebird');
const _ = require('lodash');

const CHATZ_BOT_USERNAME = 'Chatz Bot';
const CONFIG_SLACK = ['access_token', 'team', 'team_id', 'team_url', 'user', 'user_id', 'channel', 'channel_id'];

function getFallbackText(text) {
  let fallback = _.replace(text, /\*/g, '');
  fallback = _.replace(fallback, /<#(\w|\d)+\|((\w|\d)+)>/g, '#$2');
  return fallback;
}

function getCommandsInfoAttachments() {
  return [
    {
      fallback: 'Comando /chz - Envie mensagens para o usuário',
      title: 'Envie mensagens para o usuário',
      text: 'Comando: /chz [mensagem]\nExemplo de uso: /chz Olá, como posso ajudá-lo?',
      color: '#007bff',
    },
    {
      fallback: 'Comando /profile - Veja o perfil do usuário',
      title: 'Veja o perfil do usuário',
      text: 'Comando: /profile',
      color: '#007bff',
    },
  ];
}

function getUserInfoAttachment(user) {
  const information = [];
  const fields = [];
  information.push(`App: ${user.app.name}`);
  if (user.identified) {
    information.push(`ID: ${user.uid}`);
  }
  if (!user.name_generated) {
    information.push(`Nome: ${user.getFullName()}`);
  }
  if (user.email) {
    information.push(`Email: ${user.email}`);
  }
  if (user.sign_up_date) {
    information.push(`Data de cadastro: ${user.sign_up_date}`);
  }
  if (user.properties) {
    _.each(user.properties, (value, key) => {
      fields.push({title: key, value, short: true});
    });
  }
  return {
    fields,
    fallback: 'Informações do Usuário',
    title: 'Informações do Usuário',
    text: information.join('\n'),
    color: 'good',
  };
}

function getDeviceInfoAttachment(device) {
  const information = [];
  const fields = [];
  const deviceInfo = device.info;
  information.push(`Platforma: ${device.getPlatformName()}`);
  if (deviceInfo) {
    if (device.isSmartphone()) {
      if (deviceInfo.app_id && deviceInfo.app_version) {
        information.push(`Versão do app: ${deviceInfo.app_version} (${deviceInfo.app_id})`);
      }
      if (deviceInfo.os_name && deviceInfo.os_version) {
        information.push(`OS: ${deviceInfo.os_name} ${deviceInfo.os_version}`);
      }
      if (deviceInfo.manufacturer && deviceInfo.model) {
        information.push(`Smartphone: ${_.capitalize(deviceInfo.manufacturer)} ${deviceInfo.model}`);
      }
      if (deviceInfo.carrier) {
        information.push(`Operadora: ${deviceInfo.carrier}`);
      }
    }
    if (device.isWeb()) {
      if (deviceInfo.browser_name && deviceInfo.browser_version) {
        information.push(`Browser: ${deviceInfo.browser_name} ${deviceInfo.browser_version}`);
      }
    }
  }
  return {
    fields,
    fallback: 'Informações do Dispositivo',
    title: 'Informações do Dispositivo',
    text: information.join('\n'),
    color: 'warning',
  };
}

function postBotIntro(slackClient, user, channel) {
  return Promise.resolve().then(() => {
    const message = `Olá, eu sou o Chatz Bot!\n<@${user.id}> acabou de integrar este Workspace com o <http://www.chatz.io|Chatz>. Agora você pode conversar com seus clientes em tempo real, direto do Slack.`;
    return slackClient.chat.postMessage(channel.id, message, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
    });
  });
}

function postChannelIntro(slackClient, user, channel) {
  return Promise.resolve().then(() => {
    const message = `Este é o canal exclusivo para conversar com *${user.getFullName()}*.\nNeste canal você pode utilizar os seguintes comandos:`;
    return slackClient.chat.postMessage(channel.id, message, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: getCommandsInfoAttachments(),
    });
  });
}

function postProfile(slackClient, user, device, channel) {
  return Promise.resolve().then(() => {
    const message = `Estas são as informações que nós temos até agora sobre *${user.getFullName()}*.`;
    return slackClient.chat.postMessage(channel.id, message, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: [getUserInfoAttachment(user), getDeviceInfoAttachment(device)],
    });
  });
}

function createChannel(slackClient, user, conflict) {
  return Promise.resolve().then(() => {
    let channel;
    if (!conflict) {
      channel = user.getFullName();
    } else if (conflict === 1) {
      channel = _.truncate(user.getFullName(), {length: 13, omission: ''});
      channel += `-${user.uid}`;
    } else {
      channel = user.id;
    }
    channel = _.replace(`chz-${channel}`, /\s+/g);
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

function introduceUser(slackClient, user, device, message, supportChannel, userChannel) {
  return Promise.resolve().then(() => {
    const introMessage = `*${user.getFullName()}* quer conversar com o seu time no canal <#${userChannel.id}|${userChannel.name}>`;
    return slackClient.chat.postMessage(supportChannel.id, introMessage, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: [{
        fallback: getFallbackText(introMessage),
        text: message,
        color: 'good',
      }],
    });
  }).then(() => {
    return postChannelIntro(slackClient, user, userChannel);
  }).then(() => {
    return postProfile(slackClient, user, device, userChannel);
  });
}

function createChannelIntroducingUser(slackClient, user, device, message, supportChannel) {
  return createChannel(slackClient, user).bind({}).tap((userChannel) => {
    this.userChannel = userChannel;
    return introduceUser(slackClient, user, device, message, supportChannel, userChannel);
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

function unarchiveChannelIntroducingUser(slackClient, userChannel, user, device, message, supportChannel) {
  return slackClient.channels.unarchive(userChannel.id).then(() => {
    return introduceUser(slackClient, user, device, message, supportChannel, userChannel);
  }).then(() => {
    return userChannel;
  }).catch((err) => {
    if (err.message === 'not_archived') {
      return userChannel;
    }
    throw err;
  });
}

exports.addIntegration = (app, accessToken) => {
  return Promise.resolve().bind({}).then(() => {
    this.slackClient = new SlackClient(accessToken);
    return this.slackClient.auth.test();
  }).then((result) => {
    this.configuration = {
      access_token: accessToken,
      team: {
        id: result.team_id,
        name: result.team,
        url: result.url,
      },
      user: {
        id: result.user_id,
        name: result.user,
      },
    };
    return this.slackClient.channels.list({exclude_archived: true, exclude_members: true});
  }).then((result) => {
    const configuration = this.configuration;
    _.each(result.channels, (channel) => {
      if (channel.is_general) {
        configuration.channel = _.pick(channel, ['id', 'name']);
      }
    });
    return integrations.add(app, constants.integration.channels.SLACK, constants.integration.types.BUSINESS, _.pick(configuration, CONFIG_SLACK));
  }).tap(() => {
    return postBotIntro(this.slackClient, this.configuration.user, this.configuration.channel);
  });
};

exports.listChannels = (app) => {
  return integrations.getConfiguration(app, constants.integration.channels.SLACK).then((configuration) => {
    const slackClient = new SlackClient(configuration.access_token);
    return slackClient.channels.list({exclude_archived: true, exclude_members: true});
  }).then((result) => {
    const channels = [];
    _.each(result.channels, (channel) => {
      channels.push(_.pick(channel, ['id', 'name']));
    });
    return channels;
  });
};

exports.createChannel = (app, channel) => {
  return integrations.getConfiguration(app, constants.integration.channels.SLACK).then((configuration) => {
    const slackClient = new SlackClient(configuration.access_token);
    return slackClient.channels.create(channel);
  }).then((result) => {
    return _.pick(result.channel, ['id', 'name']);
  });
};

exports.postMessage = (user, device, configuration, message) => {
  return Promise.resolve().bind({}).then(() => {
    this.slackClient = new SlackClient(configuration.access_token);
    if (user.extra && user.extra.slack_channel) {
      return getChannel(this.slackClient, user).bind(this).then((channel) => {
        if (!channel) {
          return createChannelIntroducingUser(this.slackClient, user, device, message, configuration.channel);
        } else if (channel.archived) {
          return unarchiveChannelIntroducingUser(this.slackClient, channel, user, device, message, configuration.channel);
        }
        return channel;
      });
    }
    return createChannelIntroducingUser(this.slackClient, user, device, message, configuration.channel);
  }).then((channel) => {
    return this.slackClient.chat.postMessage(channel.id, message, {
      username: user.getFullName() + (user.name_generated ? ' (nome gerado)' : ''),
      as_user: false,
      icon_url: user.photo_url,
    });
  }).then(() => {
    return null;
  });
};

exports.postProfile = (user, device, configuration) => {
  return Promise.resolve().then(() => {
    const slackClient = new SlackClient(configuration.access_token);
    if (user.extra && user.extra.slack_channel) {
      return postProfile(slackClient, user, device, {id: user.extra.slack_channel});
    }
    return null;
  }).then(() => {
    return null;
  });
};

exports.extractUser = (data) => {
  return userCommons.findUser({'extra.slack_channel.id': data.channel_id}, {require: true});
};

exports.extractAuthor = (data, integration) => {
  return Promise.resolve().then(() => {
    const slackClient = new SlackClient(integration.configuration.access_token);
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

exports.confirmMessage = (data, integration, user, chatMessage) => {
  return Promise.resolve().then(() => {
    const slackClient = new SlackClient(integration.configuration.access_token);
    return slackClient.chat.postMessage(data.channel_id, chatMessage.text, {
      username: `${chatMessage.author.name} para ${user.getFullName()}`,
      as_user: false,
      icon_url: chatMessage.author.photo_url,
    });
  });
};
