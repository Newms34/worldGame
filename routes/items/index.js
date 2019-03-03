const express = require('express'),
    router = express.Router(),
    path = require('path'),
    chalk = require('chalk'),
    mongoose = require('mongoose'),
    models = require('../../models/'),
    session = require('express-session');

router.post('/newUnit',(req,res,next)=>{
	const reqProps = ['name','owner','melee','ranged','rangedDist','hp','speed','armor','canRepair','canBuild','ally','requiredTech']
})
router.post('/newNation', (req,res,next)=>{
	const reqProps = [{
		name:'nationName',
		type:'string'
	},{
		name:'id',
		type:'string'
	},{
		name:'nationDesc',
		type:'string'
	},{
		name:'leaderName',
		type:'string'
	},{
		name:'leaderDesc',
		type:'string'
	},{
		name:'leaderIntro',
		type:'string'
	}];
	const notOk=!!reqProps.filter(rp=>{
		return !req.body[rp.name] || typeof req.body[rp.name]!=rp.type;
	}).length;
});

module.exports = router;