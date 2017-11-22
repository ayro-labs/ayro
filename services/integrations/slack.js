const apis = require('../../utils/apis');
const files = require('../../utils/files');
const constants = require('../../utils/constants');
const integrationCommons = require('../commons/integration');
const userCommons = require('../commons/user');
const Promise = require('bluebird');
const _ = require('lodash');

const CHANNEL_PREFIX = 'chz';
const CHATZ_BOT_USERNAME = 'Chatz';

function getFallbackText(text) {
  let fallback = _.replace(text, /\*/g, '');
  fallback = _.replace(fallback, /<(#|@)(\w|\d)+(\|((\w|\d)+)?)>/g, '#$2');
  return fallback;
}

function getCommandsInfoAttachments() {
  return [
    {
      fallback: 'Comando /chz - Envie mensagens para o usuário',
      title: 'Envie mensagens para o usuário',
      text: 'Comando: /chz [mensagem]',
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
  if (user.getFullName()) {
    information.push(`Nome: ${user.getFullName()}${user.generated_name ? ' (Gerado automaticamente)' : ''}`);
  }
  if (user.email) {
    information.push(`Email: ${user.email}`);
  }
  if (user.sign_up_date) {
    information.push(`Cadastro: ${user.sign_up_date}`);
  }
  if (user.properties) {
    _.each(user.properties, (value, key) => {
      fields.push({title: key, value, short: true});
    });
  }
  return {
    fields,
    pretext: `Estas são as informações que nós temos até agora sobre *${user.getFullName()}*.`,
    fallback: 'Informações do usuário',
    text: information.join('\n'),
    mrkdwn_in: ['text', 'pretext'],
    color: '#007bff',
  };
}

function getDeviceInfoAttachments(user) {
  const attachments = [];
  user.devices.forEach((device) => {
    const deviceInfo = device.info;
    const information = [];
    if (deviceInfo) {
      if (device.isSmartphone()) {
        if (deviceInfo.app_id && deviceInfo.app_version) {
          information.push(`Versão do app: ${deviceInfo.app_version} (${deviceInfo.app_id})`);
        }
        if (deviceInfo.operating_system) {
          information.push(`OS: ${deviceInfo.operating_system}`);
        }
        if (deviceInfo.manufacturer && deviceInfo.model) {
          information.push(`Smartphone: ${_.capitalize(deviceInfo.manufacturer)} ${deviceInfo.model}`);
        }
        if (deviceInfo.carrier) {
          information.push(`Operadora: ${deviceInfo.carrier}`);
        }
      } else if (device.isWeb()) {
        if (deviceInfo.browser_name && deviceInfo.browser_version) {
          information.push(`Browser: ${_.capitalize(deviceInfo.browser_name)} ${deviceInfo.browser_version}`);
        }
        if (deviceInfo.operating_system) {
          information.push(`OS: ${deviceInfo.operating_system}`);
        }
        if (deviceInfo.location) {
          information.push(`Location: ${deviceInfo.location}`);
        }
      } else if (device.isMessenger()) {
        if (deviceInfo.profile_name) {
          information.push(`Nome do perfil: ${deviceInfo.profile_name} (<${deviceInfo.profile_picture}|foto>)`);
        }
        if (deviceInfo.profile_gender) {
          const profileGender = constants.genders[_.toUpper(deviceInfo.profile_gender)];
          if (profileGender) {
            information.push(`Gênero: ${profileGender}`);
          }
        }
        if (deviceInfo.profile_locale) {
          information.push(`Localidade: ${deviceInfo.profile_locale}`);
        }
        if (deviceInfo.profile_timezone) {
          information.push(`Fuso horário: ${deviceInfo.profile_timezone}`);
        }
      }
    }
    attachments.push({
      title: device.getPlatformName(),
      fallback: device.getPlatformName(),
      text: information.join('\n'),
      mrkdwn_in: ['text', 'pretext'],
      color: '#007bff',
    });
  });
  if (attachments.length > 0) {
    attachments[0].pretext = 'Estes são os últimos dispositivos utilizados.';
  }
  return attachments;
}

function postBotIntro(slackApi, user, channel) {
  return Promise.coroutine(function* () {
    const message = `Olá, eu sou o Chatz Bot!\n<@${user.id}> acabou de integrar este Workspace com o <https://chatz.io|Chatz>. Agora você pode conversar com seus clientes em tempo real, direto do Slack.`;
    yield slackApi.chat.postMessage(channel.id, message, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
    });
  })();
}

function postChannelIntro(slackApi, user, channel) {
  return Promise.coroutine(function* () {
    const message = `Este é o canal exclusivo para conversar com *${user.getFullName()}*.\nNeste canal você pode utilizar os seguintes comandos:`;
    yield slackApi.chat.postMessage(channel.id, message, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: getCommandsInfoAttachments(),
    });
  })();
}

function postProfile(slackApi, user, channel) {
  return Promise.coroutine(function* () {
    yield slackApi.chat.postMessage(channel.id, '', {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: _.concat(getUserInfoAttachment(user), getDeviceInfoAttachments(user)),
    });
  })();
}

function createChannel(slackApi, user, conflicts) {
  return Promise.coroutine(function* () {
    let channel;
    if (!conflicts) {
      channel = `${CHANNEL_PREFIX} ${user.getFullName()}`;
      channel = _.truncate(channel, {length: 21, omission: ''});
    } else {
      const charsRemaining = 21 - (CHANNEL_PREFIX.length + String(conflicts).length + 2);
      channel = _.truncate(user.getFullName(), {length: charsRemaining, omission: ''});
      channel = `${CHANNEL_PREFIX} ${channel} ${conflicts}`;
    }
    channel = _.deburr(channel);
    try {
      const result = yield slackApi.channels.create(channel);
      return {id: result.channel.id, name: result.channel.name};
    } catch (err) {
      if (err.message === 'name_taken') {
        conflicts = conflicts ? conflicts + 1 : 1;
        return createChannel(slackApi, user, conflicts);
      }
      throw err;
    }
  })();
}

function introduceUser(slackApi, user, message, supportChannel, userChannel) {
  return Promise.coroutine(function* () {
    const introMessage = `*${user.getFullName()}* quer conversar com o seu time no canal <#${userChannel.id}|${userChannel.name}>`;
    yield slackApi.chat.postMessage(supportChannel.id, introMessage, {
      username: CHATZ_BOT_USERNAME,
      as_user: false,
      attachments: [{
        fallback: getFallbackText(introMessage),
        text: message,
        color: '#007bff',
      }],
    });
    yield postChannelIntro(slackApi, user, userChannel);
    yield postProfile(slackApi, user, userChannel);
  })();
}

function createChannelIntroducingUser(slackApi, user, message, supportChannel) {
  return Promise.coroutine(function* () {
    const userChannel = yield createChannel(slackApi, user);
    yield introduceUser(slackApi, user, message, supportChannel, userChannel);
    yield userCommons.updateUser(user, {extra: _.assign(user.extra || {}, {slack_channel: userChannel})});
    return userChannel;
  })();
}

function getChannel(slackApi, user) {
  return Promise.coroutine(function* () {
    try {
      const result = yield slackApi.channels.info(user.extra.slack_channel.id);
      return {id: result.channel.id, name: result.channel.name, archived: result.channel.is_archived};
    } catch (err) {
      if (err.message === 'channel_not_found') {
        return null;
      }
      throw err;
    }
  })();
}

function unarchiveChannelIntroducingUser(slackApi, user, device, message, supportChannel, userChannel) {
  return Promise.coroutine(function* () {
    try {
      yield slackApi.channels.unarchive(userChannel.id);
      yield introduceUser(slackApi, user, device, message, supportChannel, userChannel);
      return userChannel;
    } catch (err) {
      if (err.message === 'not_archived') {
        return userChannel;
      }
      throw err;
    }
  })();
}

exports.addIntegration = (app, accessToken) => {
  return Promise.coroutine(function* () {
    const slackApi = apis.slack(accessToken);
    const testResult = yield slackApi.auth.test();
    const configuration = {
      team: {
        id: testResult.team_id,
        name: testResult.team,
        url: testResult.url,
      },
      user: {
        id: testResult.user_id,
        name: testResult.user,
        access_token: accessToken,
      },
    };
    const listResult = yield slackApi.channels.list({exclude_archived: true, exclude_members: true});
    _.each(listResult.channels, (channel) => {
      if (channel.is_general) {
        configuration.channel = _.pick(channel, ['id', 'name']);
      }
    });
    let integration = yield integrationCommons.getIntegration(app, constants.integration.channels.SLACK, {require: false});
    if (!integration) {
      integration = yield integrationCommons.addIntegration(app, constants.integration.channels.SLACK, constants.integration.types.BUSINESS, configuration);
    } else {
      integration = yield integrationCommons.updateIntegration(app, constants.integration.channels.SLACK, configuration);
    }
    yield postBotIntro(slackApi, configuration.user, configuration.channel);
    return integration;
  })();
};

exports.updateIntegration = (app, channel) => {
  return Promise.resolve().then(() => {
    const configuration = {channel};
    return integrationCommons.updateIntegration(app, constants.integration.channels.SLACK, configuration);
  });
};

exports.removeIntegration = (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.SLACK);
};

exports.listChannels = (app) => {
  return Promise.coroutine(function* () {
    const integration = yield integrationCommons.getIntegration(app, constants.integration.channels.SLACK);
    const slackApi = apis.slack(integration.configuration);
    const result = yield slackApi.channels.list({exclude_archived: true, exclude_members: true});
    const channels = [];
    _.each(result.channels, (channel) => {
      channels.push(_.pick(channel, ['id', 'name']));
    });
    return channels;
  })();
};

exports.createChannel = (app, channel) => {
  return Promise.coroutine(function* () {
    const integration = yield integrationCommons.getIntegration(app, constants.integration.channels.SLACK);
    const slackApi = apis.slack(integration.configuration);
    const result = yield slackApi.channels.create(channel);
    return _.pick(result.channel, ['id', 'name']);
  })();
};

exports.postMessage = (configuration, user, message) => {
  return Promise.coroutine(function* () {
    const slackApi = apis.slack(configuration);
    let userChannel;
    if (user.extra && user.extra.slack_channel) {
      userChannel = yield getChannel(slackApi, user);
      if (!userChannel) {
        userChannel = yield createChannelIntroducingUser(slackApi, user, message, configuration.channel);
      } else if (userChannel.archived) {
        userChannel = yield unarchiveChannelIntroducingUser(slackApi, user, message, configuration.channel, userChannel);
      }
    } else {
      userChannel = yield createChannelIntroducingUser(slackApi, user, message, configuration.channel);
    }
    yield slackApi.chat.postMessage(userChannel.id, message, {
      username: user.getFullName(),
      as_user: false,
      icon_url: files.getUserPhoto(user),
    });
  })();
};

exports.postProfile = (configuration, user) => {
  return Promise.coroutine(function* () {
    const slackApi = apis.slack(configuration);
    if (user.extra && user.extra.slack_channel) {
      yield postProfile(slackApi, user, user.extra.slack_channel);
    }
  })();
};

exports.extractUser = (data) => {
  return userCommons.findUser({'extra.slack_channel.id': data.channel_id}, {require: true});
};

exports.extractAgent = (configuration, data) => {
  return Promise.coroutine(function* () {
    const slackApi = apis.slack(configuration);
    const result = yield slackApi.users.info(data.user_id);
    return {
      id: data.user_id,
      name: result.user.profile.real_name,
      photo_url: result.user.profile.image_192,
    };
  })();
};

exports.extractText = (data) => {
  return Promise.resolve(data.text);
};

exports.confirmMessage = (configuration, data, user, chatMessage) => {
  return Promise.coroutine(function* () {
    const slackApi = apis.slack(configuration);
    yield slackApi.chat.postMessage(data.channel_id, chatMessage.text, {
      username: `${chatMessage.agent.name} para ${user.getFullName()}`,
      as_user: false,
      icon_url: chatMessage.agent.photo_url,
    });
  })();
};
