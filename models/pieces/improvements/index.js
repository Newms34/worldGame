const mongoose = require('mongoose'),
    uuid = require('uuid'),
    improvementSchema = new mongoose.Schema({
        name: String, //name of thing
        requiredTech: String,
        id: { type: String, default: uuid.v1() },
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
            },
            cult: {
                type: Number,
                default: 0
            },
            faith: {
                type: Number,
                default: 0
            }
        },
        owner: String,
        rot: {
            type: Number,
            default: 0
        }
    }, { collection: 'Improvement' });

mongoose.model('Improvement', improvementSchema);