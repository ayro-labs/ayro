'use strict'

let _ = require('lodash');

exports.toObject = function(object) {
  return object.then(function(model) {
    return model.toObject();
  });
};

exports.set = function(model, attributes) {
  _.each(attributes, function(value, key) {
    model.set(key, value);
  });
};