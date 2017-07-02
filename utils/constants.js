'use strict';

exports.integration = Object.freeze({
  channels: Object.freeze({
    USER: 'user',
    BUSINESS: 'business'
  }),
  types: Object.freeze({
    WEBSITE: 'website',
    ANDROID: 'android',
    IOS: 'ios',
    SLACK: 'slack',
  })
});

exports.device = Object.freeze({
  platforms: Object.freeze({
    WEB: 'web',
    ANDROID: 'android',
    IOS: 'ios'
  })
});