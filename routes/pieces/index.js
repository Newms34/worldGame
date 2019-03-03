const express = require('express'),
    router = express.Router(),
    path = require('path'),
    chalk = require('chalk'),
    mongoose = require('mongoose'),
    models = require('../../models/'),
    session = require('express-session'),
    authbit = (req, res, next) => {
        if (!req.session || !req.session.user || !req.session.user.id) {
            res.status(500).send('err');
        } else {
            next();
        }
    },
    getGame = (req, res, next) => {
        mongoose.model('Game').findOne({ id: req.sesion.user.currGame }, (err, gm) => {
            if (err || !gm || gm == null) {
                res.status(500).send('err');
                return false;
            } else {
                req.body.gm = gm;
                next();
            }
        })
    };

router.post('/new', authbit, (req, res, next) => {
    const reqProps = ['name', 'owner', 'melee', 'ranged', 'rangedDist', 'hp', 'speed', 'armor', 'canRepair', 'canBuild', 'ally', 'requiredTech', 'pieceType'];
    if (reqProps.filter(unp => !req.body[unp]).length) {
        res.status(422).send('missingInfo');
        return false;
    }
    mongoose.model(req.body.pieceType).findOne({ name: req.body.name }, (err, unit) => {
        if (unit && unit != null) {
            res.status(400).send('duplicate');
        } else {
            mongoose.model('Tech').findOne({ id: req.body.requiredTech }, (err, tf) => {
                if (err || !tf || tf == null) {
                    res.status(422).send('noTech');
                } else {
                    mongoose.model(req.body.pieceType).create(req.body, (err, r) => {
                        if (err) {
                            res.status(400).send(err);

                        } else {
                            //okay!
                            tf['allowed'+req.body.pieceType].push(r.id);
                            r.save((err,prod)=>{
                            	res.send(err||'done');
                            })
                        }
                    });
                }
            });
        }
    });
})

router.get('/byId', authbit, (req, res, next) => {
    if (!req.query.id || !req.query.pieceType) {
        res.status(422).send('missingInfo');
        return false;
    }
    mongoose.model('Unit').findOne({ id: req.body.id }, (err, u) => {
        res.send(err || u);
    })
})
router.get('/byName', authbit, (req, res, next) => {
    if (!req.query.name || !req.query.pieceType) {
        res.status(422).send('missingInfo');
        return false;
    }
    mongoose.model('Unit').findOne({ name: req.body.name }, (err, u) => {
        res.send(err || u);
    });
})
router.get('/byUserTechLvl', authbit, getGame, (req, res, next) => {
    if (!req.query.pieceType) {
        res.status(422).send('missingInfo');
        return false;
    }
    const techLvls = req.body.gm.playerList.filter(pl => pl.id == req.session.user.id)[0].techs;
    mongoose.model('Unit').find({ requiredTech: { $in: techLvls } }, (err, u) => {
        res.send(err || u);
    });
})

//placement routes are in GAME bit.

module.exports = router;