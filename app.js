'use strict';

require('newrelic');

const {logger} = require('@ayro/commons');
const settings = require('./configs/settings');
const routes = require('./configs/routes');
const path = require('path');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bearerToken = require('express-bearer-token');
require('json.date-extensions');

logger.setup({
  file: path.resolve('ayro.log'),
  level: settings.debug ? 'debug' : 'info',
});

// Parse string to date when call JSON.parse
JSON.useDateParser();

const app = express();

app.set('env', settings.env);
app.set('port', settings.port);

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(compression());
app.use(cors());
app.use(morgan('tiny', {stream: {write: message => logger.console.debug(message)}}));
app.use(bearerToken({bodyKey: 'off', queryKey: 'off'}));
app.use(express.static(settings.publicPath));

logger.info('Using %s environment settings', settings.env);
logger.info('Debug mode is %s', settings.debug ? 'ON' : 'OFF');

routes.configure(express, app);

app.listen(app.get('port'), () => {
  logger.info('Ayro server is listening on port %s', app.get('port'));
});
