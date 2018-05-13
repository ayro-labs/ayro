'use strict';

const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const files = require('../../utils/files');
const apis = require('../../utils/apis');
const integrationQueries = require('../../utils/queries/integration');
const userQueries = require('../../utils/queries/user');
const integrationCommons = require('../commons/integration');
const _ = require('lodash');

const CHANNEL_PREFIX = 'ch';
const AYRO_BOT_USERNAME = 'Ayro';
const PRIMARY_COLOR = '#7c00bd';

const CHANNEL_NOT_FOUND = 'channel_not_found';
const CHANNEL_NOT_ARCHIVED = 'not_archived';
const CHANNEL_NAME_TAKEN = 'name_taken';

function getFallbackText(text) {
  let fallback = _.replace(text, /\*/g, '');
  fallback = _.replace(fallback, /<(#|@)(\w|\d)+(\|((\w|\d)+)?)>/g, '#$2');
  return fallback;
}

function randomNameWarningAttachments(user) {
  const attachments = [];
  if (user.random_name) {
    attachments.push({
      fallback: 'Nome gerado randomicamente',
      text: 'O nome deste usuário foi gerado randomicamente porque não foi atribuído nenhum nome para ele.\nSaiba mais em https://www.ayro.io/guides/user-information.',
      color: 'warning',
    });
  }
  return attachments;
}

function getCommandsInfoAttachments(insideChannel) {
  let pretext;
  if (insideChannel) {
    pretext = 'Neste canal você pode utilizar os seguintes comandos:';
  } else {
    pretext = 'Nos canais você pode utilizar os seguintes comandos:';
  }
  return [
    {
      pretext,
      fallback: 'Comando /send - Envie mensagens para o usuário',
      title: 'Envie mensagens para o usuário',
      text: 'Comando: /send [mensagem]',
      color: PRIMARY_COLOR,
    },
    {
      fallback: 'Comando /profile - Veja o perfil do usuário',
      title: 'Veja o perfil do usuário',
      text: 'Comando: /profile',
      color: PRIMARY_COLOR,
    },
  ];
}

function getUserInfoAttachments(user) {
  const information = [];
  const fields = [];
  information.push(`App: ${user.app.name}`);
  if (user.identified) {
    information.push(`ID: ${user.uid}`);
  }
  if (user.getFullName()) {
    information.push(`Nome: ${user.getFullName()}${user.random_name ? ' (Gerado randomicamente)' : ''}`);
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
  return [{
    fields,
    pretext: `Estas são as informações que nós temos até agora sobre *${user.getFullName()}*:`,
    fallback: 'Informações do usuário',
    text: information.join('\n'),
    mrkdwn_in: ['text', 'pretext'],
    color: PRIMARY_COLOR,
  }];
}

function getDeviceInfoAttachments(user) {
  const attachments = [];
  _.each(user.devices, (device) => {
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
      } else if (device.isBrowser()) {
        if (deviceInfo.browser_name) {
          information.push(`Nome: ${_.capitalize(deviceInfo.browser_name)}`);
        }
        if (deviceInfo.browser_version) {
          information.push(`Versão: ${deviceInfo.browser_version}`);
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
      color: PRIMARY_COLOR,
    });
  });
  if (!_.isEmpty(attachments)) {
    attachments[0].pretext = 'Estes são os últimos dispositivos utilizados:';
  }
  return attachments;
}

async function postBotIntro(slackApi, user, channel) {
  const text = `Olá, eu sou o Ayro Bot!\n<@${user.id}> acabou de integrar este Workspace com o <https://ayro.io|Ayro>. Agora você pode conversar com seus clientes em tempo real, direto do Slack.`;
  await slackApi.chat.postMessage({
    text,
    channel: channel.id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
}

async function postChannelIntro(slackApi, user, channel) {
  const text = `Este é o canal exclusivo para conversar com *${user.getFullName()}*.`;
  const attachments = [
    ...randomNameWarningAttachments(user),
    ...getCommandsInfoAttachments(true),
    ...getUserInfoAttachments(user),
    ...getDeviceInfoAttachments(user),
  ];
  await slackApi.chat.postMessage({
    text,
    attachments,
    channel: channel.id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
}

async function postUserIntro(slackApi, user, chatMessage, supportChannel, userChannel) {
  const intro = `*${user.getFullName()}* quer conversar com o seu time no canal <#${userChannel.id}|${userChannel.name}>`;
  await slackApi.chat.postMessage({
    text: intro,
    channel: supportChannel.id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
    attachments: [{
      text: chatMessage.text,
      fallback: getFallbackText(chatMessage.text),
      color: PRIMARY_COLOR,
    }],
  });
  await postChannelIntro(slackApi, user, userChannel);
}

async function postProfile(slackApi, user, channel) {
  const attachments = [
    ...getUserInfoAttachments(user),
    ...getDeviceInfoAttachments(user),
  ];
  await slackApi.chat.postMessage({
    attachments,
    channel: channel.id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
}

async function getChannel(slackApi, user) {
  try {
    const result = await slackApi.channels.info({channel: user.extra.slack_channel.id});
    return {id: result.channel.id, name: result.channel.name, archived: result.channel.is_archived};
  } catch (err) {
    if (err.data.error === CHANNEL_NOT_FOUND) {
      return null;
    }
    throw err;
  }
}

async function createChannel(slackApi, user, conflicts) {
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
    const result = await slackApi.channels.create({name: channel});
    return {id: result.channel.id, name: result.channel.name};
  } catch (err) {
    if (err.data.error === CHANNEL_NAME_TAKEN) {
      const conflictsInc = conflicts ? conflicts + 1 : 1;
      return createChannel(slackApi, user, conflictsInc);
    }
    throw err;
  }
}

async function createChannelIntroducingUser(slackApi, user, chatMessage, supportChannel) {
  const userChannel = await createChannel(slackApi, user);
  await postUserIntro(slackApi, user, chatMessage, supportChannel, userChannel);
  await user.update({extra: _.assign(user.extra || {}, {slack_channel: userChannel})}, {runValidators: true});
  return userChannel;
}

async function unarchiveChannelIntroducingUser(slackApi, user, chatMessage, supportChannel, userChannel) {
  try {
    await slackApi.channels.unarchive({channel: userChannel.id});
    await postUserIntro(slackApi, user, chatMessage, supportChannel, userChannel);
    return userChannel;
  } catch (err) {
    if (err.data.error === CHANNEL_NOT_ARCHIVED) {
      return userChannel;
    }
    throw err;
  }
}

exports.addIntegration = async (app, accessToken) => {
  const slackApi = apis.slack(accessToken);
  const testResult = await slackApi.auth.test();
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
  let integration = await integrationQueries.findIntegration({channel: constants.integration.channels.SLACK, 'configuration.team.id': configuration.team.id}, {require: false});
  if (integration) {
    throw errors.ayroError('slack_workspace_already_integrated', 'Slack workspace already integrated');
  }
  const listResult = await slackApi.channels.list({exclude_archived: true, exclude_members: true});
  _.each(listResult.channels, (channel) => {
    if (channel.is_general) {
      configuration.channel = _.pick(channel, ['id', 'name']);
    }
  });
  integration = await integrationCommons.addIntegration(app, constants.integration.channels.SLACK, constants.integration.types.BUSINESS, configuration);
  await postBotIntro(slackApi, configuration.user, configuration.channel);
  return integration;
};

exports.updateIntegration = async (app, channel) => {
  const configuration = {channel};
  return integrationCommons.updateIntegration(app, constants.integration.channels.SLACK, configuration);
};

exports.removeIntegration = async (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.SLACK);
};

exports.postMessage = async (configuration, user, chatMessage) => {
  const slackApi = apis.slack(configuration);
  let userChannel;
  if (user.extra && user.extra.slack_channel) {
    userChannel = await getChannel(slackApi, user);
    if (!userChannel) {
      userChannel = await createChannelIntroducingUser(slackApi, user, chatMessage, configuration.channel);
    } else if (userChannel.archived) {
      userChannel = await unarchiveChannelIntroducingUser(slackApi, user, chatMessage, configuration.channel, userChannel);
    }
  } else {
    userChannel = await createChannelIntroducingUser(slackApi, user, chatMessage, configuration.channel);
  }
  await slackApi.chat.postMessage({
    text: chatMessage.text,
    channel: userChannel.id,
    username: user.getFullName(),
    as_user: false,
    icon_url: files.getUserPhoto(user),
  });
};

exports.postProfile = async (configuration, user) => {
  const slackApi = apis.slack(configuration);
  if (user.extra && user.extra.slack_channel) {
    await postProfile(slackApi, user, user.extra.slack_channel);
  }
};

exports.postHelp = async (configuration, data) => {
  const slackApi = apis.slack(configuration);
  const text = 'Ayro é uma ferramenta de suporte ao cliente totalmente integrado ao Slack. Converse com seus clientes em tempo real através dos canais com prefixo "ch".';
  await slackApi.chat.postEphemeral({
    text,
    channel: data.channel_id,
    user: data.user_id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
    attachments: getCommandsInfoAttachments(false),
  });
};

exports.postUserNotFound = async (configuration, data) => {
  const slackApi = apis.slack(configuration);
  const text = 'Este canal não está associado a nenhum usuário. Lembre-se, os canais dos usuários possuem o prefixo "ch".';
  await slackApi.chat.postEphemeral({
    text,
    channel: data.channel_id,
    user: data.user_id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
};

exports.postMessageError = async (configuration, data) => {
  const slackApi = apis.slack(configuration);
  const text = 'Não foi possível enviar a mensagem, por favor tente novamente em alguns instantes.';
  await slackApi.chat.postEphemeral({
    text,
    channel: data.channel_id,
    user: data.user_id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
};

exports.postProfileError = async (configuration, data) => {
  const slackApi = apis.slack(configuration);
  const text = 'Não foi possível obter o perfil do usuário, por favor tente novamente em alguns instantes.';
  await slackApi.chat.postEphemeral({
    text,
    channel: data.channel_id,
    user: data.user_id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
};

exports.getIntegration = async (data) => {
  return integrationQueries.findIntegration({channel: constants.integration.channels.SLACK, 'configuration.team.id': data.team_id});
};

exports.getAgent = async (configuration, data) => {
  const slackApi = apis.slack(configuration);
  const result = await slackApi.users.info({user: data.user_id});
  return {
    id: data.user_id,
    name: result.user.profile.real_name,
    photo_url: result.user.profile.image_192,
  };
};

exports.getUser = async (data) => {
  return userQueries.findUser({'extra.slack_channel.id': data.channel_id});
};

exports.getText = async (data) => {
  return data.text;
};

exports.confirmMessage = async (configuration, data, user, chatMessage) => {
  const slackApi = apis.slack(configuration);
  await slackApi.chat.postMessage({
    text: chatMessage.text,
    channel: data.channel_id,
    username: `${chatMessage.agent.name} para ${user.getFullName()}`,
    as_user: false,
    icon_url: chatMessage.agent.photo_url,
  });
};

exports.listChannels = async (app) => {
  const integration = await integrationQueries.getIntegration(app, constants.integration.channels.SLACK);
  const slackApi = apis.slack(integration.configuration);
  const result = await slackApi.channels.list({exclude_archived: true, exclude_members: true});
  const channels = [];
  _.each(result.channels, (channel) => {
    channels.push(_.pick(channel, ['id', 'name']));
  });
  return channels;
};

exports.createChannel = async (app, channel) => {
  const integration = await integrationQueries.getIntegration(app, constants.integration.channels.SLACK);
  const slackApi = apis.slack(integration.configuration);
  const result = await slackApi.channels.create({name: channel});
  return _.pick(result.channel, ['id', 'name']);
};
