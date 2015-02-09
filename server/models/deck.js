var angoose = require('angoose'),
    mongoose = angoose.getMongoose();

var DeckSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true
    },
    cards: {
        type: [Number],
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

var Deck = mongoose.model('Deck', DeckSchema);
