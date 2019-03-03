const mongoose = require('mongoose'),
    uuid = require('uuid'),
    gameSchema = new mongoose.Schema({
        name: String, //name of game, so that user can identify it
        id: { type: String, default: uuid.v1() }, //unique id of game for internal use.
        startDate: { type: Date, default: Date.now },
        running: { type: Boolean, default: false }, //this is set to false initially to allow people to join. It's then set to true once the game starts.
        lastPlayed: { type: Date, default: Date.now }
        playerList: [{
            id: String,
            techs: [String], //unlocked tech ids
            //see notes for relationship lvls
            relations: [{
                id: String,
                lvl: { type: Number, default: 3 },
                isFighting: { type: Boolean, default: false },
                researchPact: { type: Boolean, default: false }
            }]
        }], //player list
        cellList: [ //row
            [{ //indv cell
                contents: [{
                    unitId: String,
                    hp: Number,
                    lvl: Number
                    currXp: Number //percent (sort of?) xp to next lvl
                }]
                resource: {
                    //a resource like coal or sheep
                    recType: {
                        type: Number,
                        default: 0
                    },
                    recNum: {
                        //how much this improvement gives
                        type: Number,
                        default: 0
                    }
                },
                owner: String, //id of owner (or null)
                improv: {
                    //tile improvements, like roads 
                    id: {
                        type: String,
                        default: ''
                    },
                    name: {
                        type: String,
                        default: ''
                    }
                    rot: {
                        type: Number,
                        default: 0
                    }, //rotation (0,90,180,270)
                    impSubImg: String, //uri of image, to display specific improvement. doesn't change the actual improvement 'abilities'
                    abilities: {
                        def: {
                            type: Number,
                            default: 0
                        },
                        att: {
                            type: Number,
                            default: 0
                        },
                        spd: {
                            type: Boolean,
                            default: false
                        },
                        sci: {
                            type: Number,
                            default: 0
                        },
                        diplo: {
                            type: Boolean,
                            default: false
                        },
                        prod: {
                            type: Number,
                            default: 0
                        }
                        cult: {
                            type: Number,
                            default: 0
                        },
                        faith: {
                            type: Number,
                            default: 0
                        }
                    }
                }
            }]
        ]

    }, { collection: 'Game' });

mongoose.model('Game', gameSchema);