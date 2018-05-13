'use strict';

require('newrelic');

const {properties, logger, loggerServer} = require('@ayro/commons');
const path = require('path');

properties.setup(path.join(__dirname, 'config.properties'));
logger.setup(path.join(__dirname, 'ayro.log'));
loggerServer.setup();

const settings = require('./configs/settings');
const routes = require('./configs/routes');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bearerToken = require('express-bearer-token');

require('json.date-extensions');

// Parse string to date when call JSON.parse
JSON.useDateParser();

const app = express();

app.set('env', settings.env);
app.set('port', settings.port);

app.use(compression());
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('tiny', {stream: {write: message => loggerServer.debug(message)}}));
app.use(cors());
app.use(express.static(settings.publicPath));
app.use(bearerToken({
  bodyKey: 'off',
  queryKey: 'off',
}));

routes.configure(express, app);

app.listen(app.get('port'), () => {
  logger.info('Ayro server is listening on port %s', app.get('port'));
});
