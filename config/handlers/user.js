const User = require('../models/User');
const hashHandler = require('../utils/hashHandler');
const authHandler = require('../utils/authHandler');

function loadLoginPage(req, res) {
    res.render('guest-pages/login.hbs');
}
function loadRegisterPage(req, res) {
    res.render('guest-pages/register.hbs');
}
async function loginHandler(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return invalidData();
    }
    const user = await User.findOne({ username }).lean();
    if(!user){
        return invalidData();
    }
    const passwordStatus = await hashHandler.checkPassword(password, user.password);
    if(!passwordStatus){
        return invalidData();
    }
    res = authHandler.setCookie(res, user);
    res.redirect('/');

    function invalidData(){
        return res.render('guest-pages/login.hbs', {
            errMessage: 'Invalid Username or Password!',
            username,
            password
        });
    }
}
async function registerHandler(req, res) {
    const { username, password, rePassword } = req.body;

    if (!username) {
        return invalidData('Username can not be empty!');
    }
    else if(!password){
        return invalidData('Password can not be empty!');
    }
    else if(!rePassword){
        return invalidData('Repeat Password can not be empty!');
    }
    else if (password !== rePassword) {
        return invalidData('Password and Repeat Password must match!');
    }
    const checkUsername = await User.findOne({username})
    if(checkUsername){
        return invalidData(`This username is already in use! You can try with ${username}123`);
    }
    const hashedPassword = hashHandler.hashPassword(password);
    const user = new User({ username, password: hashedPassword });
    const status = await user.save();
    if (status) {
        console.log('User registered successfully');
        res = authHandler.setCookie(res, user);
    }
    res.redirect('/');

    function invalidData(errMessage){
        return res.render('guest-pages/register.hbs', {
            errMessage,
            username,
            password,
            rePassword
        });
    }
}
function logoutHandler(req, res){
    res.clearCookie('token');
    res.redirect('/');
}

module.exports = {
    loadLoginPage,
    loadRegisterPage,
    loginHandler,
    registerHandler,
    logoutHandler
}
