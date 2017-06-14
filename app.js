'use strict';

let express      = require('express'),
    morgan       = require('morgan'),
    compression  = require('compression'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser'),
    redis        = require('redis'),
    path         = require('path'),
    session      = require('jwt-redis-session'),
    routes       = require('./configs/routes'),
    middlewares  = require('./configs/middlewares'),
    settings     = require('./configs/settings'),
    logger       = require('./utils/logger'),
    serverLogger = require('./utils/logger-server');

// Parse string to date when call JSON.parse
require('json.date-extensions');
JSON.useDateParser();

let app = express();

app.set('env', settings.env);
app.set('port', settings.port);
app.set('public', settings.publicPath);

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('tiny', {stream: serverLogger.stream}));
app.use(express.static(app.get('public')));

let redisClient = redis.createClient(settings.redis.port, settings.redis.host);
redisClient.auth(settings.redis.password, function(err) {
  if (err) {
    throw new Error('Error authenticating Redis client');
  }
});

app.use(session({
  client: redisClient,
  secret: 'chatz',
  keyspace: 'session:',
  requestArg: 'token',
  maxAge: Number.MAX_SAFE_INTEGER
}));

middlewares.configure(app);
routes.configure(express, app);

let server = app.listen(app.get('port'), function() {
  logger.info('Chatz server is listening on port %s', server.address().port);
});