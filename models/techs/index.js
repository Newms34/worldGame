const mongoose = require('mongoose'),
    uuid = require('uuid'),
    techSchema = new mongoose.Schema({
        name: String,
        id: { type: String, default: uuid.v1() },
        allowedUnit:[String],
        allowedStructure:[String],
        allowedImprovement:[String],
        prereqs:['']
    }, { collection: 'Techs' });

mongoose.model('Techs', techSchema);