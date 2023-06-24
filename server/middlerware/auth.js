
exports.isLogin = async (req, res, next) => {
    try {
        if (req.session.userId) {
        } else {
            res.redirect('/')
        }
        next()
    } catch (error) {
        console.log(error.message);
        res.send({ message: error.message || "Error Occured" });
    }
}

exports.isLogout = async (req, res, next) => {
    try {
        if (req.session.userId) {
            res.redirect('/home')
        }
        next()
    } catch (error) {
        console.log(error.message);
        res.send({ message: error.message || "Error Occured" });
    }
}