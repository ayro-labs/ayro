'use strict';

const constants = require('utils/constants');
const errors = require('utils/errors');
const apis = require('utils/apis');
const integrationQueries = require('database/queries/integration');
const userQueries = require('database/queries/user');
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
      if (device.isBrowser()) {
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
      } else if (device.isSmartphone()) {
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
      } else if (device.isEmail()) {
        if (deviceInfo.email) {
          information.push(`Email: ${deviceInfo.email}`);
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

async function postUserIntro(slackApi, user, chatMessage, supportChannel, userChannel) {
  const intro = `*${user.getFullName()}* quer conversar com o seu time no canal <#${userChannel.id}|${userChannel.name}>`;
  let attachments = [];
  if (chatMessage.text) {
    attachments.push({
      text: chatMessage.text,
      fallback: getFallbackText(chatMessage.text),
      color: PRIMARY_COLOR,
    });
  }
  await slackApi.chat.postMessage({
    attachments,
    text: intro,
    channel: supportChannel.id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
  const text = `Este é o canal exclusivo para conversar com *${user.getFullName()}*.`;
  attachments = [
    ...randomNameWarningAttachments(user),
    ...getCommandsInfoAttachments(true),
    ...getUserInfoAttachments(user),
    ...getDeviceInfoAttachments(user),
  ];
  await slackApi.chat.postMessage({
    text,
    attachments,
    channel: userChannel.id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
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
  if (!user.extra || !user.extra.slack_channel) {
    return null;
  }
  try {
    const result = await slackApi.channels.info({channel: user.extra.slack_channel.id});
    return {
      id: result.channel.id,
      name: result.channel.name,
      archived: result.channel.is_archived,
    };
  } catch (err) {
    if (err.data.error === CHANNEL_NOT_FOUND) {
      return null;
    }
    throw err;
  }
}

async function createChannel(slackApi, user, conflicts) {
  let name = '';
  if (!conflicts) {
    name = `${CHANNEL_PREFIX} ${user.getFullName()}`;
    name = _.truncate(name, {length: 21, omission: ''});
  } else {
    const charsRemaining = 21 - (CHANNEL_PREFIX.length + String(conflicts).length + 2);
    name = _.truncate(user.getFullName(), {length: charsRemaining, omission: ''});
    name = `${CHANNEL_PREFIX} ${name} ${conflicts}`;
  }
  name = _.deburr(name);
  try {
    const result = await slackApi.channels.create({name});
    const channel = {id: result.channel.id, name: result.channel.name};
    await user.update({extra: _.assign(user.extra || {}, {slack_channel: channel})}, {runValidators: true});
    return channel;
  } catch (err) {
    if (err.data.error !== CHANNEL_NAME_TAKEN) {
      throw err;
    }
    const conflictsInc = conflicts ? conflicts + 1 : 1;
    return createChannel(slackApi, user, conflictsInc);
  }
}

async function unarchiveChannel(slackApi, channel) {
  try {
    await slackApi.channels.unarchive({channel: channel.id});
    channel.archived = false;
  } catch (err) {
    if (err.data.error !== CHANNEL_NOT_ARCHIVED) {
      throw err;
    }
  }
}

async function createChannelIntroducingUser(slackApi, user, chatMessage, supportChannel) {
  const userChannel = await createChannel(slackApi, user);
  await postUserIntro(slackApi, user, chatMessage, supportChannel, userChannel);
  return userChannel;
}

async function unarchiveChannelIntroducingUser(slackApi, user, chatMessage, supportChannel, userChannel) {
  await unarchiveChannel(slackApi, userChannel);
  await postUserIntro(slackApi, user, chatMessage, supportChannel, userChannel);
}

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

exports.getUser = async (configuration, data) => {
  return userQueries.findUser({'extra.slack_channel.id': data.channel_id});
};

exports.getText = async (configuration, data) => {
  return data.text;
};

exports.postMessage = async (configuration, user, chatMessage) => {
  const slackApi = apis.slack(configuration);
  const supportChannel = configuration.channel;
  const userChannel = await getChannel(slackApi, user) || await createChannelIntroducingUser(slackApi, user, chatMessage, supportChannel);
  if (userChannel.archived) {
    await unarchiveChannelIntroducingUser(slackApi, user, chatMessage, supportChannel, userChannel);
  }
  await slackApi.chat.postMessage({
    text: chatMessage.text,
    channel: userChannel.id,
    username: user.getFullName(),
    as_user: false,
    icon_url: user.avatar_url,
  });
};

exports.postFile = async (configuration, user, chatMessage) => {
  const slackApi = apis.slack(configuration);
  const supportChannel = configuration.channel;
  const userChannel = await getChannel(slackApi, user) || await createChannelIntroducingUser(slackApi, user, chatMessage, supportChannel);
  if (userChannel.archived) {
    await unarchiveChannelIntroducingUser(slackApi, user, chatMessage, supportChannel, userChannel);
  }
  await slackApi.chat.postMessage({
    attachments: [{
      fallback: chatMessage.media.name,
      title: chatMessage.media.name,
      title_link: chatMessage.media.url,
      image_url: chatMessage.media.url,
      color: PRIMARY_COLOR,
    }],
    channel: userChannel.id,
    username: user.getFullName(),
    as_user: false,
    icon_url: user.avatar_url,
  });
};

exports.postEmailConnected = async (configuration, user, email) => {
  const text = `Este usuário gostaria de ser contactado através do email ${email}, caso não receba uma resposta imediata da sua equipe. Por favor utilize o comando */send* para respondê-lo.`;
  const slackApi = apis.slack(configuration);
  const userChannel = await getChannel(slackApi, user) || await createChannel(slackApi, user);
  if (userChannel.archived) {
    await unarchiveChannel(slackApi, userChannel);
  }
  await slackApi.chat.postMessage({
    text,
    channel: userChannel.id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
};

exports.postProfile = async (configuration, user) => {
  const slackApi = apis.slack(configuration);
  if (!user.extra || !user.extra.slack_channel) {
    throw errors.ayroError(CHANNEL_NOT_FOUND, 'Channel not found');
  }
  await postProfile(slackApi, user, user.extra.slack_channel);
};

exports.postHelp = async (configuration, data) => {
  const text = 'Ayro é uma ferramenta de suporte ao cliente totalmente integrado ao Slack. Converse com seus clientes em tempo real através dos canais com prefixo "ch".';
  const slackApi = apis.slack(configuration);
  await slackApi.chat.postEphemeral({
    text,
    attachments: getCommandsInfoAttachments(false),
    channel: data.channel_id,
    user: data.user_id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
};

exports.postUserNotFound = async (configuration, data) => {
  const text = 'Este canal não está associado a nenhum usuário. Lembre-se, os canais dos usuários possuem o prefixo "ch".';
  const slackApi = apis.slack(configuration);
  await slackApi.chat.postEphemeral({
    text,
    channel: data.channel_id,
    user: data.user_id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
};

exports.postMessageError = async (configuration, data) => {
  const text = 'Não foi possível enviar a mensagem, por favor tente novamente em alguns instantes.';
  const slackApi = apis.slack(configuration);
  await slackApi.chat.postEphemeral({
    text,
    channel: data.channel_id,
    user: data.user_id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
};

exports.postProfileError = async (configuration, data) => {
  const text = 'Não foi possível obter o perfil do usuário, por favor tente novamente em alguns instantes.';
  const slackApi = apis.slack(configuration);
  await slackApi.chat.postEphemeral({
    text,
    channel: data.channel_id,
    user: data.user_id,
    username: AYRO_BOT_USERNAME,
    as_user: false,
  });
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

