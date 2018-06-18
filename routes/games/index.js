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
        mongoose.model('Game').findOne({ id: req.body.gameId }, (err, gm) => {
            if (err || !gm || gm == null) {
                res.status(500).send('err');
                return false;
            } else {
                req.game = gm;
                next();
            }
        })
    },
    killUnit = (gm, dier,res) => {
        //kill a unit
        const dierPos = gm.cellList[dier.y][dier.x].contents.map(u=>u.id).indexOf(dier.id);
        gm.cellList[dier.y][dier.x].contents.splice(dierPos,1);
        mongoose.model('Game').update({ 'id': gm.id }, gm, function(r) {
            res.send(gm);
        })
    }, 
    moveUnit=(gm,unit,target)=>{
        /*move a unit (or try to!) 
        Each cell can have ONE combat unit, ONE civilian unit, and ONE 'special' unit*/
        //first, check if there's stuff there of this unit's type AND owner (overlap)
        if(gm.cellList[unit.y][unit.x].contents.filter(t=>t.type==unit.type && t.owner == unit.owner).length){
            return 'overlap';
        }else if(gm.cellList[unit.y][unit.x].contents.filter(t=>t.type==unit.type).length){
            return 'attack';
        }else if(calcDist(unit.x,unit.y,target.x,target.y)>1.5){
            return 'tooFar';//unit is trying to move to a non-adjacent 
        }else if(unit.moves<1){
            return 'noMoves';
        }else{
            return 'move';
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
        res.status(500).send({ status: 'invalCombat'});
    } else {
        //now we need to figure out attacks
        const dist = calcDist(req.body.agg.x, req.body.agg.y, req.body.def.x, req.body.def.y);
        if (req.body.def.firstStrike && dist <= 1.5) {
            //defending unit has firstStrike, allowing them to do dmg FIRST. This ONLY occurs in melee range
            req.body.agg.hp -= Math.ceil(req.body.def.melee * 0.5 * Math.random());
            //check if firstStrike killed attacker
            if (req.body.agg.hp <= 0) {
                killUnit(req.body.gm, req.body.agg,res)
            }
        }else if(dist>1.5 && req.body.agg.rangeDist>dist){
            //ranged
            req.body.def.hp-=Math.ceil(req.body.agg.ranged*Math.random());
        }else if(dist<1.5){
            //melee
            req.body.def.hp-=Math.ceil(req.body.agg.melee*Math.random());
        }else{
            //too far?
        }
        if(req.body.def.hp<=0){
            killUnit(req.body.gm, req.body.def,res);
        }else{
            res.send({agg:req.body.agg,def:req.body.def});
        }
    }
})

module.exports = router;