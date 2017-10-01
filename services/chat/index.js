const ChatMessage = require('../../models').ChatMessage;
const constants = require('../../utils/constants');
const errors = require('../../utils/errors');
const userCommons = require('../commons/user');
const slack = require('../integrations/slack');
const push = require('../integrations/push');
const Promise = require('bluebird');
const _ = require('lodash');

const EVENT_CHAT_MESSAGE = 'chat_message';

const getBusinessIntegration = (channel) => {
  switch (channel) {
    case constants.integration.channels.SLACK:
      return slack;
    default:
      return null;
  }
};

exports.listMessages = (user, device) => {
  return ChatMessage.find({user: user.id, device: device.id}).sort({date: 'desc'}).exec().then((chatMessages) => {
    return _.reverse(chatMessages);
  });
};

exports.postMessage = (user, device, message) => {
  return Promise.all([userCommons.getUser(user.id), userCommons.getDevice(device.id)]).bind({}).spread((user, device) => {
    if (String(user.id) !== String(device.user)) {
      throw errors.chatzError('device.unknown', 'Unknown device');
    }
    this.device = device;
    if (!user.latest_device || user.latest_device.toString() !== device.id) {
      return userCommons.updateUser(user, {latest_device: device.id});
    }
    return user;
  }).then((user) => {
    return userCommons.populateUser(user, 'app devices');
  }).then((user) => {
    this.user = user;
    this.chatMessage = new ChatMessage({
      user: this.user.id,
      device: this.device.id,
      text: message.text,
      direction: constants.chatMessage.directions.OUTGOING,
      date: new Date(),
    });
    return this.chatMessage.save();
  }).then((chatMessage) => {
    const context = this;
    const integrations = this.user.app.listIntegrations(constants.integration.types.BUSINESS);
    const promises = [];
    integrations.forEach((integration) => {
      const businessIntegration = getBusinessIntegration(integration.channel);
      if (businessIntegration) {
        promises.push(businessIntegration.postMessage(integration.configuration, context.user, chatMessage.text));
      }
    });
    return Promise.all(promises);
  }).then(() => {
    return this.chatMessage;
  });
};

exports.pushMessage = (channel, data) => {
  return Promise.bind({}).then(() => {
    const businessIntegration = getBusinessIntegration(channel);
    if (!businessIntegration) {
      throw errors.chatzError('integration.notSupported', 'Integration not supported');
    }
    this.businessIntegration = businessIntegration;
    return businessIntegration.extractUser(data);
  }).then((user) => {
    return userCommons.getUser(user.id, {populate: 'app latest_device'});
  }).then((user) => {
    const integration = user.app.getIntegration(channel);
    if (!integration) {
      throw errors.chatzError('integration.notSupported', 'Integration not supported');
    }
    this.user = user;
    this.integration = integration;
    return Promise.all([
      this.businessIntegration.extractAgent(integration.configuration, data),
      this.businessIntegration.extractText(data),
    ]);
  }).spread((agent, text) => {
    const chatMessage = new ChatMessage({
      agent,
      text,
      user: this.user.id,
      device: this.user.latest_device.id,
      direction: constants.chatMessage.directions.INCOMING,
      date: new Date(),
    });
    return chatMessage.save();
  }).then((chatMessage) => {
    this.chatMessage = chatMessage;
    return push.message(this.user, EVENT_CHAT_MESSAGE, this.chatMessage);
  }).then(() => {
    return this.businessIntegration.confirmMessage(this.integration.configuration, data, this.user, this.chatMessage);
  }).then(() => {
    return null;
  });
};

exports.postProfile = (channel, data) => {
  return Promise.bind({}).then(() => {
    const businessIntegration = getBusinessIntegration(channel);
    if (!businessIntegration) {
      throw errors.chatzError('integration.notSupported', 'Integration not supported');
    }
    this.businessIntegration = businessIntegration;
    return businessIntegration.extractUser(data);
  }).then((user) => {
    return userCommons.getUser(user.id, {populate: 'app devices'});
  }).then((user) => {
    const integration = user.app.getIntegration(channel);
    if (!integration) {
      throw errors.chatzError('integration.notSupported', 'Integration not supported');
    }
    return this.businessIntegration.postProfile(integration.configuration, user);
  }).then(() => {
    return null;
  });
};
