const mongoose = require('mongoose'),
    uuid = require('uuid'),
    improvementSchema = new mongoose.Schema({
    name: String, //name of thing
    requiredTech: String,
    id: { type: String, default: uuid.v1() },
    mods:{
    	science:Number,
    	production:Number,
    	happy:Number,
    	faith:Number,
        travel:Number,
        def:Number,
        att:Number
    },
    x:Number,
    y:Number,
    city:String,//city that owns this,
    owner:String
}, { collection: 'Improvement' });

mongoose.model('Improvement', improvementSchema);