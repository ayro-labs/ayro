'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

const topics = {};

exports.subscribe = (topic, promise) => {
  if (!topics[topic]) {
    topics[topic] = [];
  }
  topics[topic].push(promise);
};

exports.publish = async (topic, data) => {
  const subscribers = topics[topic];
  if (subscribers) {
    const promises = _.map(subscribers, (subscriber) => {
      return subscriber(data).catch(() => {
        // Nothing to do...
      });
    });
    await Promise.all(promises);
  }
};
