const properties = require('properties');
const path = require('path');
const parse = require('deasync')(properties.parse);

const config = parse(path.join(__dirname, '../config.properties'), {path: true, sections: true});

exports.getValue = (key, defaultValue) => {
  let value = config;
  let found = true;
  const splits = key.split('.');
  for (let index = 0; index < splits.length; index += 1) {
    const split = splits[index];
    if (!value[split]) {
      found = false;
      break;
    }
    value = value[split];
  }
  return found ? value : defaultValue;
};
