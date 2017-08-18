exports.integration = Object.freeze({
  types: Object.freeze({
    USER: 'user',
    BUSINESS: 'business',
  }),
  channels: Object.freeze({
    WEBSITE: 'website',
    ANDROID: 'android',
    IOS: 'ios',
    SLACK: 'slack',
  }),
});

exports.device = Object.freeze({
  platforms: Object.freeze({
    WEB: 'web',
    ANDROID: 'android',
    IOS: 'ios',
  }),
});

exports.chatMessage = Object.freeze({
  directions: Object.freeze({
    INCOMING: 'incoming',
    OUTGOING: 'outgoing',
  }),
});
