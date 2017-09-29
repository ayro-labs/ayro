exports.integration = Object.freeze({
  types: Object.freeze({
    USER: 'user',
    BUSINESS: 'business',
  }),
  channels: Object.freeze({
    WEBSITE: 'website',
    ANDROID: 'android',
    IOS: 'ios',
    MESSENGER: 'messenger',
    SLACK: 'slack',
  }),
});

exports.device = Object.freeze({
  platforms: Object.freeze({
    WEB: Object.freeze({
      id: 'web',
      name: 'Web Messenger',
    }),
    ANDROID: Object.freeze({
      id: 'android',
      name: 'Android Messaging',
    }),
    IOS: Object.freeze({
      id: 'ios',
      name: 'iOS Messaging',
    }),
  }),
});

exports.chatMessage = Object.freeze({
  directions: Object.freeze({
    INCOMING: 'incoming',
    OUTGOING: 'outgoing',
  }),
});
