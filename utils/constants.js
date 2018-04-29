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
  plugin: Object.freeze({
    types: Object.freeze({
      WELCOME_MESSAGE: 'welcome_message',
      OFFICE_HOURS: 'out_of_office',
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
