const express = require('express'),
    router = express.Router(),
    path = require('path'),
    mongoose = require('mongoose'),
    models = require('../../models/'),
    chalk = require('chalk'),
    session = require('express-session');

router.post('/register', (req, res, next) => {
    if (!req.body.user || !req.body.pwd) {
        res.status(500).send({ status: 'noData' });
        return false;
    }
    //record new user
    const un = req.body.user,
        pwd = req.body.password,
        prof = parseInt(req.body.prof) || 1;
    mongoose.model('User').findOne({ 'name': un }, (err, user) => {
        if (!user) {
            //this user does not exist yet, so okay to go ahead and record their un and pwd then make a new user!
            const salt = mongoose.model('User').generateSalt();
            const newUser = {
                name: un,
                dispName: req.body.displayName || un,
                salt: salt,
                pass: mongoose.model('User').encryptPassword(pwd, salt),
                currGames: [],
                doneGames: []
            }
            console.log(newUser);
            mongoose.model('User').create(newUser);
            res.send('saved!')
        } else {
            res.status(500).send({ status: 'duplicate' });
        }
    });
});

router.post('/login', (req, res, next) => {
    mongoose.model('User').findOne({ 'name': req.body.user }, (err, usr) => {
        console.log('USER FROM LOGIN:', usr);
        if (err || !usr || usr === null) {
            //most likely, this user doesn't exist.
            res.status(500).send({ status: 'logErr' });;
        } else if (usr.correctPassword(req.body.pwd)) {
            delete usr.pass;
            delete usr.salt;
            req.session.user = usr;
            res.send({ status: 'logGood', usr: user });
        } else {
            res.status(500).send({ status: 'logErr' });
        }
    });
});



module.exports = router;