const mongoose = require('mongoose'),
    uuid = require('uuid'),
    gameSchema = new mongoose.Schema({
        name: String, //name of game, so that user can identify it
        id: { type: String, default: uuid.v1() }, //unique id of game for internal use.
        startDate: { type: Date, default: Date.now },
        running: { type: Boolean, default: false }, //this is set to false initially to allow people to join. It's then set to true once the game starts.
        lastPlayed: { type: Date, default: Date.now }
        playerList: [{ id: String, techs: [String] }], //player list
        cellList: [ //row
            [{ //indv cell
                contents: [{
                    unitId: String,
                    hp: Number,
                    lvl: Number
                    currXp: Number//percent (sort of?) xp to next lvl
                }]
                resource: {
                    recType: {
                        type: Number,
                        default: 0
                    },
                    recNum: {
                        type: Number,
                        default: 0
                    }
                }
            }]
        ]

    }, { collection: 'Game' });

mongoose.model('Game', gameSchema);