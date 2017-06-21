'use strict';

let integrations = require('.'),
    constants = require('../../utils/constants'),
    Project = require('../../models').Project,
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

let getApiToken = function(project) {
  return Project.findById(project._id).exec().then(function(project) {
    if (!project) {
      return null;
    }
    let integration = project.getIntegrationOfType(constants.integrationTypes.SLACK);
    if (!integration) {
      return null;
    }
    return integration.configuration.api_token;
  });
};

exports.add = function(project, apiToken) {
  return checkAuthentication(apiToken).then(function(authentication) {
    let configuration = {
      api_token: apiToken,
      team: authentication.team,
      team_id: authentication.team_id,
      team_url: authentication.url,
      user: authentication.user,
      user_id: authentication.user_id
    };
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
  return getApiToken(project).then(function(apiToken) {
    if (!apiToken) {
      return [];
    }
    var slackClient = new SlackClient(apiToken);
    return slackClient.channels.list({exclude_archived: true, exclude_members: true});
  });
};

exports.createChannel = function(project, channel) {
  return getApiToken(project).then(function(apiToken) {
    if (!apiToken) {
      return [];
    }
    var slackClient = new SlackClient(apiToken);
    return slackClient.channels.create({name: channel});
  });
};