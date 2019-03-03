const mongoose = require('mongoose'),
    uuid = require('uuid'),
    unitSchema = new mongoose.Schema({
        name: String,
        id: { type: String, default: uuid.v1() },
        owner: String,//who owns this unit. NOT to be confused with the prop below, which determines if a unit is only buildable by a certain civ
        reqCiv:{type:String,default:null},//if non-null, this unit can ONLY be build by the indicated civ (by ID string)
        melee: Number, //unit's raw melee strength
        ranged: Number, //unit's raw ranged str
        rangeDist: {type:Number, default:-1}, //number of tiles unit can fire over. -1 if unit cannot range
        hp:Number,
        speed:Number,
        x:Number,
        y:Number,
        armor: Number, //some units (tanks? etc?) have an armor percent
        isMil:{type:Boolean, default:true},//unit type: military or non-military
        canRepair: {type:Boolean, default:false}, //can this unit repair?
        canBuild: {type:Boolean, default:false}, //can this unit build new structures? generally only for workers
        canFound:{type:Boolean, default:false},//can this unit found cities? only settlers, maybe for something else later

        firstStrike:{type:Boolean, default:false},//if firstStrike, unit can essentially counter-attack BEFORE another unit attacks it
        mtns: Boolean,//can unit cross mountains? usually either flying or specific mountaineer units.
        type:Number,//0=combat, 1= civilian, 2= special
        ally: {
            allyRange: Number,
            noLOS: Boolean, //if true, this allows nearby units to attack stuff hidden behind mountains
            plusDef: Number,
            plusAtt: Number,
            healPerTurn: Number
        },
        requiredTech: {
            type: String,
            default: 'none'
        } //the name of the tech required to build this unit. Defaults to 'none' for beginning units
    }, { collection: 'Unit' });

mongoose.model('Unit', unitSchema);