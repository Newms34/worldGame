const express = require('express'),
    router = express.Router(),
    path = require('path'),
    chalk = require('chalk'),
    mongoose = require('mongoose'),
    models = require('../../models/'),
    session = require('express-session');

router.post('/new',(req,res,next)=>{
	const reqProps = ['name','owner','melee','ranged','rangedDist','hp','speed','armor','canRepair','canBuild','ally','requiredTech']
})

module.exports = router;