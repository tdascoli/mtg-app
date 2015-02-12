var angoose = require('angoose'),
    mongoose = angoose.getMongoose();

var GameSchema = mongoose.Schema({
    player1: {
        type: String,
        required: true
    },
    player2: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    saved: {
        type: String,
        required: true
    },
    player1Stats: {
        hitpoints: Number,
        infection: Number,
        library: [Number],
        cards: [{
            offset: {
                top: Number,
                left: Number
            },
            number: Number,
            zIndex: Number,
            multiverseid: Number,
            counter: Number,
            tapped: Boolean,
            in: String
        }]
    },
    player2Stats: {
        hitpoints: Number,
        infection: Number,
        library: [Number],
        cards: [{
            offset: {
                top: Number,
                left: Number
            },
            number: Number,
            zIndex: Number,
            multiverseid: Number,
            counter: Number,
            tapped: Boolean,
            in: String
        }]
    },
    date: { type: Date, default: Date.now }
});

var Game = mongoose.model('Game', GameSchema);