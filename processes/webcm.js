const settings = require('../configs/settings');
const logger = require('../utils/logger');
const sessions = require('../utils/sessions');
const http = require('http');
const restify = require('restify');
const faye = require('faye');
const util = require('util');

const SUBSCRIPTION_PATTERN = '/users/%s';
const SUBSCRIBE_CHANNEL = '/meta/subscribe';
const AUTH_ERROR = 'api.token.invalid';

function emitAuthError(message, callback) {
  message.error = AUTH_ERROR;
  callback(message);
}

const authentication = {
  incoming: (message, callback) => {
    if (message.channel !== SUBSCRIBE_CHANNEL) {
      callback(message);
      return;
    }
    if (!message.ext || !message.ext.api_token) {
      emitAuthError(message, callback);
      return;
    }
    sessions.getUser(message.ext.api_token).then((user) => {
      if (util.format(SUBSCRIPTION_PATTERN, user.id) === message.subscription) {
        logger.info('Subscribing user %s', user.id);
        callback(message);
      }
    }).catch(() => {
      emitAuthError(message, callback);
    });
  },
};

const server = restify.createServer({name: 'Web Cloud Messaging'});
server.use(restify.queryParser());
server.use(restify.bodyParser());

const pubSubServer = http.createServer();
const bayeux = new faye.NodeAdapter({mount: '/'});
bayeux.addExtension(authentication);
bayeux.attach(pubSubServer);

server.post('/push/:user', (req, res) => {
  logger.info('Publishing message of event %s to user %s', req.body.event, req.params.user);
  bayeux.getClient().publish(`/users/${req.params.user}`, req.body);
  res.send(200);
});

server.listen(settings.webcm.port, settings.webcm.host, null, () => {
  logger.info('%s listening at %s', server.name, server.url);
});

pubSubServer.listen(settings.webcm.pubSub.port, settings.webcm.pubSub.host, null, () => {
  logger.info('Web Cloud Messaging (Pub/Sub) listening at http://%s:%s', settings.webcm.pubSub.host, settings.webcm.pubSub.port);
});
