//Note that this is for city structures which are normally not explicitly shown. Not tile improvements.
const mongoose = require('mongoose'),
    uuid = require('uuid'),
    structureSchema = new mongoose.Schema({
        name: String, //name of thing
        owner: String,
        id: { type: String, default: uuid.v1() },
        requiredTech: {
            type: String,
            default: 'none'
        },
        mods: {
            science: Number,
            production: Number,
            happy: Number,
            faith: Number,
            travel: Number,
            def: Number,
            att: Number
        },
        workSlots: Number,
        city: String,
        reqCiv:{type:String,default:null}//if non-null, this building can ONLY be build by the indicated civ (by ID string)
    }, { collection: 'Structure' });

mongoose.model('Structure', structureSchema);