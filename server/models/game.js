var angoose = require('angoose'),
    mongoose = angoose.getMongoose();

var GameSchema = mongoose.Schema({
    host: {
        type: String,
        required: true
    },
    opponent: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    hostStats: {
        hitpoints: Number,
        infection: Number,
        library: [Number],
        hand: [Number],
        graveyard: [Number],
        exile: [Number],
        battlefield: [{
            offset: {
                top: Number,
                left: Number
            },
            zIndex: Number,
            multiverseid: Number,
            counter: Number,
            tapped: Boolean
        }]
    },
    opponentStats: {
        hitpoints: Number,
        infection: Number,
        library: [Number],
        hand: [Number],
        graveyard: [Number],
        exile: [Number],
        battlefield: [{
            offset: {
                top: Number,
                left: Number
            },
            zIndex: Number,
            multiverseid: Number,
            counter: Number,
            tapped: Boolean
        }]
    },
    date: { type: Date, default: Date.now }
});

var Game = mongoose.model('Game', GameSchema);