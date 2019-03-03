const mongoose = require('mongoose'),
    uuid = require('uuid'),
    nationSchema = new mongoose.Schema({
        nationName: String, //name of game, so that user can identify it
        id: { type: String, default: uuid.v1() }, //unique id of game for internal use.
        nationDesc: String,
        leaderName: String,
        leaderDesc: String,
        leaderIntro: String,
        uniqueBuilding: { type: String, default: null },
        uniqueUnit: { type: String, default: null },
        bonusTo: {
            science: {
                type: Number,
                default: 0
            },
            diplo: {
                type: Number,
                default: 0
            },
            attackLand: {
                type: Number,
                default: 0
            },
            attackAir: {
                type: Number,
                default: 0
            },
            attackSea: {
                type: Number,
                default: 0
            },
            defLand: {
                type: Number,
                default: 0
            },
            defAir: {
                type: Number,
                default: 0
            },
            defSea: {
                type: Number,
                default: 0
            },
            faith: {
                type: Number,
                default: 0
            },
        }

    }, { collection: 'Nation' });

mongoose.model('Nation', nationSchema);