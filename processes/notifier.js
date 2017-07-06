'use strict';

let settings = require('../configs/settings'),
    logger = require('../utils/logger'),
    sessions = require('../utils/sessions'),
    http = require('http'),
    restify = require('restify'),
    faye = require('faye'),
    util = require('util');

const SUBSCRIPTION_PATTERN = '/users/%s';
const SUBSCRIBE_CHANNEL = '/meta/subscribe';
const AUTH_ERROR = 'api.token.invalid';

let emitAuthError = function(message, callback) {
  message.error = AUTH_ERROR;
  callback(message);
};

let authentication = {
  incoming: function(message, callback) {
    if (message.channel !== SUBSCRIBE_CHANNEL) {
      callback(message);
      return;
    }
    if (!message.ext || !message.ext.api_token) {
      emitAuthError(message, callback);
      return;
    }
    sessions.getUser(message.ext.api_token).then(function(user) {
      if (util.format(SUBSCRIPTION_PATTERN, user.id) === message.subscription) {
        callback(message);
      }
    }).catch(function(err) {
      emitAuthError(message, callback);
    });
  }
};

let server = restify.createServer({name: 'Notifier'});
server.use(restify.queryParser());
server.use(restify.bodyParser());

let pubSubServer = http.createServer();
let bayeux = new faye.NodeAdapter({mount: '/'});
bayeux.addExtension(authentication);
bayeux.attach(pubSubServer);

server.post('/users/:user', function(req, res, next) {
  logger.info('Publishing message of event %s to user %s', req.body.event, req.params.user);
  bayeux.getClient().publish(`/users/${req.params.user}`, req.body);
  res.send(200);
});

server.listen(settings.notifier.port, settings.notifier.host, null, function() {
  logger.info('%s listening at %s', server.name, server.url);
});

pubSubServer.listen(settings.notifier.pubSub.port, settings.notifier.pubSub.host, null, function() {
  logger.info('Notifier Pub/Sub listening at http://%s:%s', settings.notifier.pubSub.host, settings.notifier.pubSub.port);
});
