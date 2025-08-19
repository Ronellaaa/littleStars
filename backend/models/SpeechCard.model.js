import mongoose from 'mongoose';

const SpeechCardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        required: true,
        enum: ["food" , "family", "actions", "emotions", "objects", "places", "people", "animals", "vehicles", "colours"]
    },

    image: {
        type: String,
        required: true
    },

    audio: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"]
    } 
},

{
    timestamps: true,
    
}

);

const SpeechCard = mongoose.model('SpeechCard', SpeechCardSchema);

export default SpeechCard;
