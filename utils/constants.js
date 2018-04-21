'use strict';

module.exports = Object.freeze({
  integration: Object.freeze({
    types: Object.freeze({
      USER: 'user',
      BUSINESS: 'business',
    }),
    channels: Object.freeze({
      WEBSITE: 'website',
      WORDPRESS: 'wordpress',
      ANDROID: 'android',
      MESSENGER: 'messenger',
      SLACK: 'slack',
    }),
  }),
  device: Object.freeze({
    platforms: Object.freeze({
      WEB: Object.freeze({
        id: 'web',
        name: 'Web Messenger',
      }),
      ANDROID: Object.freeze({
        id: 'android',
        name: 'Android Messaging',
      }),
      MESSENGER: Object.freeze({
        id: 'messenger',
        name: 'Facebook Messenger',
      }),
    }),
  }),
  chatMessage: Object.freeze({
    directions: Object.freeze({
      INCOMING: 'incoming',
      OUTGOING: 'outgoing',
    }),
  }),
  genders: Object.freeze({
    MALE: 'Masculino',
    FEMALE: 'Feminino',
  }),
});
