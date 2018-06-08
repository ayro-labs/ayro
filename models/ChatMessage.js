'use strict';

const constants = require('utils/constants');
const mongoose = require('mongoose');
const _ = require('lodash');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const Agent = new Schema({
  id: {type: String},
  name: {type: String},
  photo_url: {type: String},
}, {_id: false});

const QuickReply = new Schema({
  type: {type: String, required: true},
  title: {type: String, required: true},
  postback: {type: String},
  icon_url: {type: String},
}, {_id: false});

const Button = new Schema({
  type: {type: String, required: true},
  title: {type: String, required: true},
  postback: {type: String},
  icon_url: {type: String},
  url: {type: String},
}, {_id: false});

const Location = new Schema({
  latitude: {type: Number, required: true},
  longitude: {type: Number, required: true},
}, {_id: false});

const Media = new Schema({
  url: {type: String, required: true},
  type: {type: String},
}, {_id: false});

const ChatMessage = new Schema({
  app: {type: ObjectId, ref: 'App', required: true, index: true},
  user: {type: ObjectId, ref: 'User', required: true},
  agent: {type: Agent},
  type: {type: String, enum: _.values(constants.chatMessage.types), required: true},
  text: {type: String},
  direction: {type: String, enum: _.values(constants.chatMessage.directions), required: true},
  channel: {type: String, enum: constants.integration.userChannels, required: true},
  date: {type: Date, required: true},
  // Specific attributes
  available_channels: {type: [String], default: undefined},
  quick_replies: {type: [QuickReply], default: undefined},
  buttons: {type: [Button], default: undefined},
  location: {type: Location},
  media: {type: Media},
}, {collection: 'chat_messages'});
ChatMessage.index({user: 1, channel: 1});
ChatMessage.index({date: 1}, {expireAfterSeconds: 7776000});

module.exports = ChatMessage;
