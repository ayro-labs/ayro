const User = require('../../models').User;
const apis = require('../../utils/apis');
const userCommons = require('../commons/user');
const chatService = require('.');
const Promise = require('bluebird');

exports.postMessage = (data) => {
  // return userCommons.findDevice({'info.profile_id': data.sender.id}, {require: false}).then((device) => {
  //   if (!device) {

  //   }
  //   const user = new User({id: device.user});
  //   return chatService.postMessage(user, device, data.message.text);
  // });
};


// {
//   "sender":{
//     "id":"<PSID>"
//   },
//   "recipient":{
//     "id":"<PAGE_ID>"
//   },
//   "timestamp":1458692752478,
//   "message":{
//     "mid":"mid.1457764197618:41d102a3e1ae206a38",
//     "text":"hello, world!",
//     "quick_reply": {
//       "payload": "<DEVELOPER_DEFINED_PAYLOAD>"
//     }
//   }
// }