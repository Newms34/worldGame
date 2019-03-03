const express = require('express'),
    router = express.Router(),
    path = require('path'),
    chalk = require('chalk'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    models = require('../../models/'),
    session = require('express-session'),
    checkCellsValid = (c) => {
        let valid = true,
            i,
            j,
            k,
            brokeOne,
            brokeTwo;
        if (!c || !c instanceof Array) {
            //c does not exist or c is not an array (of rows)
            valid = false;
        }
        for (i = 0; i < c.length; i++) {
            brokeOne = false;
            //check each row to see if it's an array
            if (!c[i] instanceof Array) {
                //what should be a row (array) of cells is NOT
                valid = false;
                break;
            }
            for (j = 0; j < c[i].length; j++) {
                //check each cell
                brokeTwo = false;
                if (typeof c[i][j] !== 'object') {
                    //cell is not an object
                    brokeOne = true;
                    break;
                }
                if (c[i][j].contents instanceof Array && c[i][j].contents.length) {
                    //loop thru cell's contents, check props
                    for (k = 0; k < c[i][j].contents.length; k++) {
                        if (!c[i][j].contents[k].unitId || !c[i][j].contents[k].hp || !c[i][j].contents[k].lvl || !c[i][j].contents[k].currXp) {
                            breakTwo = false;
                            breakOne = false;
                            valid = false;
                            break;
                        }
                    }
                    zx
                    if (!breakOne) {
                        break;
                    }
                }
                if (!c[i][j].resource || (c[i][j].resource.recType && !c[i][j].resource.recNum)) {
                    //cell's resource. recType 0 == no resource
                    //basically, make sure that if we have a resource, it has a number
                    valid = false;
                    brokeOne = true;
                    break;
                }
                if (brokeTwo) {
                    valid = false;
                    brokeOne = true;
                    break;
                }
            }
            if (brokeOne) {
                //this basically allows us to cascade 'breaks'
                valid = false;
                break;
            }
        }
        return valid;
    },
    calcDist = (xo, yo, xf, yf) => {
        return Math.sqrt(Math.pow(Math.abs(xf - xo), 2) + Math.pow(Math.abs(yf - yo), 2));
    },
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
    },
    killUnit = (gm, dier, res) => {
        //kill a unit
        const dierPos = gm.cellList[dier.y][dier.x].contents.map(u => u.id).indexOf(dier.id);
        gm.cellList[dier.y][dier.x].contents.splice(dierPos, 1);
        mongoose.model('Game').update({ 'id': gm.id }, gm, function(r) {
            res.send(gm);
        })
    },
    moveUnit = (gm, unit, target) => {
        /*mcheck if unit is movable
        Each cell can have ONE combat unit, ONE civilian unit, and ONE 'special' unit*/
        //first, check if there's stuff there of this unit's type AND owner (overlap)
        if (gm.cellList[unit.y][unit.x].contents.filter(t => t.type == unit.type && t.owner == unit.owner).length) {
            return { status: 'overlap', gm: gm };
        } else if (gm.cellList[unit.y][unit.x].contents.filter(t => t.type == unit.type).length) {
            return { status: 'attack', gm: gm };
        } else if (calcDist(unit.x, unit.y, target.x, target.y) > 1.5) {
            return { status: 'tooFar', gm: gm }; //unit is trying to move to a non-adjacent 
        } else if (unit.moves < 1) {
            return { status: 'noMoves', gm: gm };
        } else {
            //okay to move, so move then send 'move'
            const pos = gm.cellList[unit.y][unit.x].contents.indexOf(unit.id); //pos in this unit's OLD cell contents array
            gm.cellList[target.y][target.x].contents.push(gm.cellList[unit.y][unit.x].contents.splice(pos, 1));
            return { status: 'move', gm: gm };
        }
    };

router.post('/new', authbit, (req, res, next) => {
    if (!req.body.gameName || !checkCellsValid(req.body.cells)) {
        res.status(500).send({ status: 'impropGame' }); //improper game format!
    } else {
        const newGame = {
            name: req.body.gameName,
            playerList: [{ id: req.session.user.id, tech: [] }],
            cells: req.body.cells
        }
        mongoose.model('Game').create(newGame);
    }
});

router.post('/fight', authbit, getGame, (req, res, next) => {
    //needs: agg (aggressor), def (defender), isRanged (boolean). agg and def need x/y vals. 
    //note that this is a unit attacking another unit, NOT a unit attacking building (or vice/versa)
    if (!req.body.agg || !req.body.def || !req.body.gameId) {
        //gameId or aggressor or defender is missing,
        res.status(500).send({ status: 'invalCombat' });
    } else {
        //now we need to figure out attacks
        const dist = calcDist(req.body.agg.x, req.body.agg.y, req.body.def.x, req.body.def.y);
        if (req.body.def.firstStrike && dist <= 1.5) {
            //defending unit has firstStrike, allowing them to do dmg FIRST. This ONLY occurs in melee range
            req.body.agg.hp -= Math.ceil(req.body.def.melee * 0.5 * Math.random());
            //check if firstStrike killed attacker
            if (req.body.agg.hp <= 0) {
                killUnit(req.body.gm, req.body.agg, res)
            }
        } else if (dist > 1.5 && req.body.agg.rangeDist > dist) {
            //ranged
            req.body.def.hp -= Math.ceil(req.body.agg.ranged * Math.random());
        } else if (dist < 1.5) {
            //melee
            req.body.def.hp -= Math.ceil(req.body.agg.melee * Math.random());
        } else {
            //too far?
        }
        if (req.body.def.hp <= 0) {
            killUnit(req.body.gm, req.body.def, res);
        } else {
            res.send({ agg: req.body.agg, def: req.body.def });
        }
    }
});
router.post('/move', authbit, getGame, (req, res, next) => {
    if (!req.body.gm || !req.body.unit || !req.body.targ) {
        res.status(422).send('missingInfo');
        return false;
    }
    let moveResult = moveUnit(req.body.gm, req.body.unit, req.body.targ);
    res.send(moveResult);
});
router.post('/buildImp', authbit, getGame, (req, res, next) => {
    //builds a tile improvement.
    if (!req.body.gm || !req.body.imp || !req.body.unit) {
        res.status(422).send('missingInfo');
        return false;
    }
    const gm = req.body.gm;
    if (gm.cellList[req.body.unit.y][req.body.unit.x].owner && gm.cellList[req.body.unit.y][req.body.unit.x].owner != req.session.user.id) {
        res.status(400).send('wrongUser');
    } else if (!req.body.replace && gm.cellList[req.body.unit.y][req.body.unit.x].improve) {
        res.status(400).send('occupiedTile');
    } else {
        //build improv
        mongoose.model('Unit').findOne({ id: req.body.unit }, (err, bunit) => {
            if (err || !bunit || !bunit.canBuild) {
                //unit either does not exist, or cannot build
                res.status(400).send('err');
                mongoose.model('Improvement').findOne({ id: req.body.imp }, (err, bimp) => {
                    if (err || !bimp) {
                        res.status(400).send('err');
                    } else {
                        gm.cellList[req.body.unit.y][req.body.unit.x].improve = bimp;
                        gm.save((err, rs) => {
                            res.send(err || gm)
                        });
                    }
                })
            }
        });
    }
});
router.post('/declareWar', authbit, getGame, (req, res, next) => {
    res.send('PEACE ONLY')
})

router.post('/foundCity',authbit,getGame,(req,res,next)=>{
    res.send ('404 city not found(ed)')
});

module.exports = router;

/*need to implement tile improvements in fight/move functions. +spd, for example, uses 0.5 moves instead of 1 if start/end on.
need way to flag two users as "at war", and other diplo relationships
*/