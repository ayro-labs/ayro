'use strict';

let settings = require('../configs/settings'),
    logger = require('../utils/logger'),
    http = require('http'),
    restify = require('restify'),
    faye = require('faye'),
    redis = require('redis'),
    jwt = require('jsonwebtoken'),
    util = require('util');

const SUBSCRIPTION_PATTERN = '/users/%s';
const SUBSCRIBE_CHANNEL = '/meta/subscribe';
const AUTH_ERROR = 'api.token.invalid';

let redisClient = redis.createClient(settings.redis.port, settings.redis.host);
redisClient.auth(settings.redis.password, function(err) {
  if (err) {
    throw new Error('Error authenticating Redis client');
  }
});

let server = restify.createServer({name: 'Notifier'});
server.use(restify.queryParser());
server.use(restify.bodyParser());

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
    jwt.verify(message.ext.api_token, settings.session.secret, function(err, decoded) {
      if (err || !decoded.jti) {
        emitAuthError(message, callback);
        return;
      }
      redisClient.get(settings.session.prefix + decoded.jti, function(err, session) {
        if (err || !session) {
          emitAuthError(message, callback);
          return;
        }
        try {
          session = JSON.parse(session);
          if (util.format(SUBSCRIPTION_PATTERN, session.user._id) === message.subscription) {
            callback(message);
          } else {
            emitAuthError(message, callback);
          }
        } catch(err) {
          emitAuthError(message, callback);
        }
      });
    });
  }
};

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
