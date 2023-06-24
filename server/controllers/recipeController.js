require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const Like = require('../models/like');
const Comment = require('../models/comment');
const User = require('../models/user');

/**
 * GET /
 * Homepage 
*/
exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber);
    const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber);
    const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber);
    const indian = await Recipe.find({ 'category': 'Indian' }).limit(limitNumber);
    const food = { latest, thai, american, chinese, indian };
    res.render('index', { title: 'Cooking Blog - Home', categories, food });
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
}

/**
 * GET /categories
 * Categories 
*/
exports.exploreCategories = async (req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categories });
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
}

/**
 * GET /categories/:id
 * Categories By Id
*/
exports.exploreCategoriesById = async (req, res) => {
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categoryById });
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
}

/**
 * GET /recipe/:id
 * Recipe 
*/
exports.exploreRecipe = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    const user = await User.findById({ _id: req.session.userId });
    const userId = user._id
  if((req.session.userId == recipe.userId) || (user.is_admin==1)){
    var update =1
  }else{
    var update =0
  }
    const likes = await Like.count({ recipeId: recipeId });
    const comments = await Comment.find({ recipeId: recipeId });
    const isLiked = await Like.find({ $and: [{ userId: userId }, { recipeId: recipeId }] });
    if (isLiked.length > 0) {
      var likeDislike = 1
    } else {
      var likeDislike = 0
    }
    res.render('recipe', { title: 'Cooking Blog - Recipe', recipe, update, likes, likeDislike, comments });
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
}

/**
 * POST /search
 * Search 
*/
exports.searchRecipe = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find({ $text: { $search: searchTerm, $diacriticSensitive: true } });
    res.render('search', { title: 'Cooking Blog - Search', recipe });
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }

}

/**
 * GET /explore-latest
 * Explplore Latest 
*/
exports.exploreLatest = async (req, res) => {
  try {
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', { title: 'Cooking Blog - Explore Latest', recipe });
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
}

/**
 * GET /explore-random
 * Explore Random as JSON
*/
exports.exploreRandom = async (req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();

    res.render('explore-random', { title: 'Cooking Blog - Explore Latest', recipe });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
}

/**
 * GET /submit-recipe
 * Submit Recipe
*/
exports.submitRecipe = async (req, res) => {
  try {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');

  res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj });
} catch (error) {
  res.send({ message: error.message || "Error Occured" });
}
}

/**
 * POST /submit-recipe
 * Submit Recipe
*/
exports.submitRecipeOnPost = async (req, res) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;
    const user = await User.findById({ _id: req.session.userId });
    const userId = user._id
    const userName = user.name
    var ingredient = req.body.ingredients
    var ingredients = ingredient.filter(Boolean)

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No Files where uploaded.');
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;
      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;
      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.satus(500).send(err);
      })
    }
    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      ingredients: ingredients,
      category: req.body.category,
      image: newImageName,
      userName: userName,
      userId: userId
    });
    await newRecipe.save();
    req.flash('infoSubmit', 'Recipe has been added.')
    res.redirect('/submit-recipe');
  } catch (error) {
    req.flash('infoErrors', error);
    res.redirect('/submit-recipe');
  }
}

/**
 * GET /
 * about 
*/
exports.about = async (req, res) => {
  try {
    res.render('about');
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
}

/**
 * GET /
 * about 
*/
exports.contact = async (req, res) => {
  try {
    res.render('contact');
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
}

// Delete Recipe
exports.deleteRecipe = async (req, res) => {
  try {
    await Recipe.deleteOne({ _id: req.params.id });
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.send({ message: error.message || "Error Occured" });
  }
}

// Update Recipe
exports.upRecipe = async (req, res) => {
  try {
    const id = req.params.id
    const recipeData = await Recipe.findById({ _id: id });
    const user = await User.findById({ _id: req.session.userId });
    const userId = user._id
    const isAdmin = user.is_admin

    if (recipeData && userId == recipeData.userId || isAdmin == 1) {
      res.render('update-recipe', { recipe: recipeData })
    } else {
      res.redirect('/recipe/' + id)
    }
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
}

exports.updateRecipe = async (req, res) => {
  try {
    var id = req.params.id
    let imageUploadFile;
    let uploadPath;
    let newImageName;
    var ingredient = req.body.ingredients
    var ingredients = ingredient.filter(Boolean)

      if (!req.files || Object.keys(req.files).length === 0) {
      await Recipe.findByIdAndUpdate({ _id: id }, {
        $set: {
          name: req.body.name,
          description: req.body.description,
          ingredients: ingredients,
          category: req.body.category
        }
      });
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;
      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;
      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.satus(500).send(err);
      })
      await Recipe.findByIdAndUpdate({ _id: id }, {
        $set: {
          name: req.body.name,
          description: req.body.description,
          ingredients: req.body.ingredients,
          category: req.body.category,
          image: newImageName
        }
      });
    }
    res.redirect('/recipe/' + id);
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
}

// exports.updateRecipe = async (req, res) => {
//   try {
//     var id = req.params.id

//     let imageUploadFile;
//     let uploadPath;
//     let newImageName;
//     var ingredient = req.body.ingredients
//     var ingredients = ingredient.filter(Boolean)

//     const user = await User.findById({ _id: req.session.userId });
//     const userId = user._id
//     const userName = user.name

//     if (!req.files || Object.keys(req.files).length === 0) {
//       await Recipe.findByIdAndUpdate({ _id: id }, {
//         $set: {
//           name: req.body.name,
//           description: req.body.description,
//           ingredients: ingredients,
//           category: req.body.category,
//           userName: userName,
//           userId: userId
//         }
//       });

//     } else {
//       imageUploadFile = req.files.image;
//       newImageName = Date.now() + imageUploadFile.name;
//       uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;
//       imageUploadFile.mv(uploadPath, function (err) {
//         if (err) return res.satus(500).send(err);
//       })
//       await Recipe.findByIdAndUpdate({ _id: id }, {
//         $set: {
//           name: req.body.name,
//           description: req.body.description,
//           ingredients: req.body.ingredients,
//           category: req.body.category,
//           image: newImageName,
//           userName: userName,
//           userId: userId
//         }
//       });
//     }
//     res.redirect('/recipe/' + id);

//   } catch (error) {
//     var id = req.params.id
//     res.redirect('/recipe/' + id);
//   }
// }

exports.sharedRecipe = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    const likes = await Like.count({ recipeId: recipeId });
    const comments = await Comment.find({ recipeId: recipeId });
    var likeDislike = 0 
    res.render('recipe-share', { title: 'Cooking Blog - Recipe', recipe,  likes, likeDislike, comments });
  } catch (error) {
    res.send({ message: error.message || "Error Occured" });
  }
} 

// exports.share = async (req, res) => {
//   try {
//     let recipeId = req.params.id;
//     const url = "http://localhost:4000/sharedRecipe/"+recipeId
//     res.render('share', { url});
//   } catch (error) {
//     res.send({ message: error.message || "Error Occured" });
//   }
// } 