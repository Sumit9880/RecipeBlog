const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'Name is required.'
  },
  email: {
    type: String,
    required: 'Email is required.'
  },
  mobile: {
    type: String,
    required: 'Mobile Number is required.'
  },
  image: {
    type: String,
    required: 'Image is required.'
  },
  password: {
    type: String,
    required: 'Password is required.'
  },
  is_admin: {
    type: Number,
    default:0
  },
  is_verified: {
    type: Number,
    default:0
  }
});

module.exports = mongoose.model('User', userSchema);