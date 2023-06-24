require('../models/database');
const User = require('../models/user');
const Comment = require('../models/comment');
const Recipe = require('../models/Recipe');




exports.comment = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const user = await User.findById({ _id: req.session.userId });
    const recipe = await Recipe.findById({ _id: recipeId });
    const userId = user._id
    const userName = user.name
    const userImage = user.image

    const comment = new Comment({
      userId: userId,
      recipeId: recipeId,
      userName: userName,
      userImage: userImage,
      text: req.body.text,
      recipeName : recipe.name
    })
    await comment.save()
    res.redirect('/recipe/' + recipeId);
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
} 