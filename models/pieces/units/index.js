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
        canRepair: {type:Boolean, default:false}, //can this unit repair?
        canBuild: {type:Boolean, default:false}, //can this unit build new structures? generally only for workers
        canFound:{type:Boolean, default:false},//can this unit found cities? only settlers, maybe for something else later
        firstStrike:{type:Boolean, default:false},//if firstStrike, unit can essentially counter-attack BEFORE another unit attacks it
        mtns: {type:Boolean, default:false},
        type:{type:Number, default:0},//0=combat, 1= civilian, 2= special
        ally: {
            allyRange: {type:Number, default:0},
            noLOS: {type:Boolean, default:false}, //if true, this allows nearby units to attack stuff hidden behind mountains
            plusDef: {type:Number, default:0},
            plusAtt: {type:Number, default:0},
            healPerTurn: {type:Number, default:0}
        },
        requiredTech: {
            type: String,
            default: 'none'
        } //the name of the tech required to build this unit. Defaults to 'none' for beginning units
    }, { collection: 'Unit' });

mongoose.model('Unit', unitSchema);