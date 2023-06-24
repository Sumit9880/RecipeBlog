const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  recipeId: {
    type: ObjectId,
    required:true
  },
  userId: {
    type: ObjectId,
    required:true
  },
  recipeName:{
    type: String,
  }
});

module.exports = mongoose.model('Like', likeSchema);