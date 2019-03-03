/*eslint-disable*/
const express = require('express'),
    router = express.Router(),
    path = require('path'),
    models = require('../models/'),
    chalk = require('chalk'),
    session = require('express-session'),
    started = { time: new Date().toLocaleString(), num: 0 };

router.use(function(req, res, next) {
    started.num++;
    next();
});
router.get('/heartbeat', function(req, res, next) {
    res.send(started);
})
router.use('/users', require('./users'));
router.use('/maps', require('./maps'));
router.use('/items', require('./items'));
router.use('/games', require('./games'));
router.get('/', function(req, res, next) {
    res.sendFile('index.html', { "root": './views' });
});
module.exports = router;