const jwt = require('jsonwebtoken');
const privateKey = require('../config/config')['tokenKey']

function userAutorization(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/');
    }
    try {
        const info = jwt.verify(token, privateKey);
        req.user = info;
        next();
    }
    catch {
        return res.redirect('/');
    }
}
function guestAutorization(req, res, next) {
    const token = req.cookies.token;
    try {
        jwt.verify(token, privateKey);
        return res.redirect('/');
    }
    catch{
        next();
    }
}
function userStatus(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        req.isLoggedIn = false;
    }
    try {
        const info = jwt.verify(token, privateKey);
        req.user = info;
        req.isLoggedIn = true;
    }
    catch{
        req.isLoggedIn = false;
    }
    next();
}

function setCookie(res, user) {
    const { _id, username } = user;
    const token = jwt.sign({ _id, username }, privateKey);
    return res.cookie('token', token);
}

module.exports = {
    setCookie,
    guestAutorization,
    userAutorization,
    userStatus
}