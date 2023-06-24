const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  recipeId: {
    type: ObjectId,
    required: true
  },
  userId: {
    type: ObjectId,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  recipeName:{
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);