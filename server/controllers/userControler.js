require('../models/database');
const User = require('../models/user');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const session = require('express-session');
const { name } = require('ejs');
const Recipe = require('../models/Recipe');
const Like = require('../models/like');
const Comment = require('../models/comment');


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}

const sendVerifyMail = async (name, email, userId) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'sumitghatage4@gmail.com',
                pass: 'kypiqbyrhvzntdre'
            }
        })
        const mailOptions = {
            from: 'sumitghatage4@gmail.com',
            to: email,
            subject: 'Mail Verification Of Recipe Blog Registration',
            html: '<p>Hi ' + name + ',Please Click Here to <a href="http://localhost:4000/verify?id=' + userId + '"> Verify </a> Your Mail.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error.message);
            } else {
                console.log("Email has been Sent", info.response);
            }

        })
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}


exports.log = async (req, res) => {
    try {
        res.render("login", { layout: 'layouts/log' })
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}

exports.sign = async (req, res) => {
    try {
        res.render("signup", { layout: 'layouts/sig' })
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}

exports.login = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const userData = await User.findOne({ email: email })

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.render('login', { message: "Please Verify your Email First...!", layout: 'layouts/log' })
                } else {
                    req.session.userId = userData._id
                    res.redirect('/home')
                }
            } else {
                res.render('login', { message: "Email And Password is Incorrect", layout: 'layouts/log' })
            }
        } else {
            res.render('login', { message: "Email And Password is Incorrect", layout: 'layouts/log' })
        }
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}

exports.signup = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password)
        let imageUploadFile;
        let uploadPath;
        let newImageName;
        imageUploadFile = req.files.image;
        newImageName = Date.now() + imageUploadFile.name;
        uploadPath = require('path').resolve('./') + '/public/uploads/userImages/' + newImageName;
        imageUploadFile.mv(uploadPath, function (err) {
            if (err) return res.satus(500).send(err);
        })
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: newImageName,
            password: spassword
        })
        const userdata = await user.save()
        if (userdata) {
            sendVerifyMail(req.body.name, req.body.email, userdata._id)
            res.render('signup', { message: "Registerd Succsessfully, Please verify your Email", layout: 'layouts/sig' })
        } else {
            res.render('signup', { message: "Failed To Register", layout: 'layouts/sig' })
        }

    } catch (error) {
        console.log(error.message);
        res.render('signup', { message: "Failed To Register", layout: 'layouts/sig' })
    }

}

exports.verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } })
        console.log(updateInfo);
        res.render('email-verified', { layout: 'layouts/log' })
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}

exports.logout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}

exports.profile = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.session.userId });
        res.render('profile', { user })
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}


exports.profileUp = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.session.userId });
        res.render('updateProfile', { user: user })
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}

exports.profileUpdate = async (req, res) => {
    try {
        var id = req.session.userId
        let imageUploadFile;
        let uploadPath;
        let newImageName;

        if (!req.files || Object.keys(req.files).length === 0) {
            await User.updateOne({_id:id},{$set:{name: req.body.name,email: req.body.email,mobile: req.body.mno}})
        } else {
            imageUploadFile = req.files.image;
            newImageName = Date.now() + imageUploadFile.name;
            uploadPath = require('path').resolve('./') + '/public/uploads/userImages/' + newImageName;
            imageUploadFile.mv(uploadPath, function (err) {
                if (err) return res.satus(500).send(err);
            })
            await User.updateOne({_id:id},{$set:{name: req.body.name,email: req.body.email,mobile: req.body.mno,image: newImageName}})
        }
        res.redirect('/profile');
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}

exports.reports = async (req, res) => {
    try {
       const categoryWiseSummary = await Recipe.aggregate([{ $group: {_id: "$category",count: { $sum: 1 }}}])
       const recipeWiseLikeSummay = await Like.aggregate([{ $group: {_id: "$recipeName",count: { $sum: 1 }}}])
       const recipeWiseCommentSummay = await Comment.aggregate([{ $group: {_id: "$recipeName",count: { $sum: 1 }}}])
       const userDetailed = await User.find({})
       res.render('reports',{categoryWiseSummary,recipeWiseLikeSummay,recipeWiseCommentSummay,userDetailed});
    } catch (error) {
        res.send({ message: error.message || "Error Occured" });
    }
}