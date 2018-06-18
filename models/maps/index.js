const mongoose = require('mongoose'),
    uuid = require('uuid'),
    mapSchema = new mongoose.Schema({
        name: String, //name of map. user gives us this
        id: { type: String, default: uuid.v1() }, //unique id of map.
        sideLeng: Number,
        pieces: [ //row
            [{ //indv cell
                cellType: Number,
            }]
        ]
    }, { collection: 'Map' });

mongoose.model('Map', mapSchema);