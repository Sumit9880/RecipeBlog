const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const userController = require('../controllers/userControler');
const likeController = require('../controllers/likeController');
const commentController = require('../controllers/commentController');
const session = require('express-session')

const secret = process.env.secret
const oneDay = 1000 * 60 * 60 * 24;
router.use(session({
    secret: secret,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}))

const auth = require('../middlerware/auth')

/**
 * App Routes  
*/
router.get('/', auth.isLogout, userController.log);
router.post('/login', userController.login);
router.get('/sign', auth.isLogout, userController.sign);
router.post('/signup', userController.signup);
router.get('/verify', userController.verifyMail);
router.get('/logout', auth.isLogin, userController.logout);
router.get('/reports', auth.isLogin, userController.reports);

router.get('/home', auth.isLogin, recipeController.homepage);
router.get('/recipe/:id', auth.isLogin, recipeController.exploreRecipe);
router.get('/sharedRecipe/:id', recipeController.sharedRecipe);
router.get('/categories', auth.isLogin, recipeController.exploreCategories);
router.get('/categories/:id', auth.isLogin, recipeController.exploreCategoriesById);
router.post('/search', auth.isLogin, recipeController.searchRecipe);
router.get('/explore-latest', auth.isLogin, recipeController.exploreLatest);
router.get('/explore-random', auth.isLogin, recipeController.exploreRandom);
router.get('/submit-recipe', auth.isLogin, recipeController.submitRecipe);
router.post('/submit-recipe', auth.isLogin, recipeController.submitRecipeOnPost);
router.get('/about', auth.isLogin, recipeController.about);
router.get('/contact', auth.isLogin, recipeController.contact);
router.get('/delete-recipe/:id', auth.isLogin, recipeController.deleteRecipe);
router.get('/upRecipe/:id', auth.isLogin, recipeController.upRecipe);
router.post('/update-Recipe/:id', auth.isLogin, recipeController.updateRecipe);
router.post('/like/:id', auth.isLogin, likeController.like);
router.post('/comment/:id', auth.isLogin, commentController.comment);
router.get('/profile', auth.isLogin, userController.profile);
router.get('/profileUp', auth.isLogin, userController.profileUp);
router.post('/profileUpdate', auth.isLogin, userController.profileUpdate);
// router.post('/share/:id', auth.isLogin, recipeController.share);

module.exports = router;