const mongoose = require('mongoose'),
    uuid = require('uuid'),
    unitSchema = new mongoose.Schema({
        name: String,
        id: { type: String, default: uuid.v1() },
        owner: String,
        melee: Number, //unit's raw melee strength
        ranged: Number, //unit's raw ranged str
        rangeDist: {type:Number, default:1}, //number of tiles unit can fire over. one if unit cannot range
        hp:Number,
        speed:Number,
        armor: Number, //some units (tanks? etc?) have an armor percent
        canRepair: Boolean, //can this unit repair?
        canBuild: Boolean, //can this unit build new structures? generally only for workers
        canFound:Boolean,//can this unit found cities? only settlers, maybe for something else later
        firstStrike:{type:Boolean, default:false},//if firstStrike, unit can essentially counter-attack BEFORE another unit attacks it
        mtns: Boolean,
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