// modules =================================================
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HabitSchema = require('./habit');

// schema ==================================================
var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  habitLimit: {
    type: Number,
    default: 3
  },

  habits: [HabitSchema]
});

module.exports = mongoose.model('User', UserSchema);
