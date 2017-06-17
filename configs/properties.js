'use strict';

let properties = require('properties'),
    path = require('path'),
    parse = require('deasync')(properties.parse),
    config = parse(path.join(__dirname, '../config.properties'), {path: true, sections: true});

exports.getValue = function(key, defaultValue) {
  let value = config;
  let found = true;
  let splits = key.split('.');
  for (let index = 0; index < splits.length; index++) {
    let split = splits[index];
    if (!value[split]) {
      found = false;
      break;
    }
    value = value[split];
  }
  return found === true ? value : defaultValue;
};