require('../models/database');
const User = require('../models/user');
const Like = require('../models/like');
const Recipe = require('../models/Recipe');



exports.like = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const user = await User.findById({ _id: req.session.userId });
    const recipe = await Recipe.findById({ _id: recipeId });
    const userId = user._id
    const isLike = await Like.find({ $and: [{ userId: userId }, { recipeId: recipeId }] });

    if (isLike.length > 0) {
      await Like.deleteOne({ $and: [{ userId: userId }, { recipeId: recipeId }] });
      res.redirect('/recipe/' + recipeId);
    } else {
      const like = new Like({
        userId: userId,
        recipeId: recipeId,
        recipeName : recipe.name
      })
      await like.save()
      res.redirect('/recipe/' + recipeId);
    }
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
} 