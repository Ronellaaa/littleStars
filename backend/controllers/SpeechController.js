import SpeechCard from '../models/SpeechCard.model.js';
import mongoose from 'mongoose';

export const createCard = async (req, res) => {
    const card = req.body;

    if(!card.title || !card.category || !card.image || !card.audio) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newSpeechCard = new SpeechCard(card);

    try {
        await newSpeechCard.save();
        res.status(201).json({ success: true, data: newSpeechCard });
    }
    catch (error) {
        console.error("Error creating speech card:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const getCardsByCategory = async (req, res) => {
    const { category } = req.params;
    console.log(`Fetching cards for category: ${category}`); // Debug log

    try{
        const cards = await SpeechCard.find({ category: category });
        res.status(200).json({ success: true, data:cards });
    }

    catch(error) {
        res.status(500).json({ success: false, message: "Server Error"});
    }

}

export const deleteCardById = async (req, res) => {
    const { id } = req.params;

    try{
        await SpeechCard.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Card deleted successfully" });
    }
    catch(error) {
        res.status(404).json({ success: false, message: "Card not found" });
    }
}

export const updateCardById = async (req, res) => {
    const { id } = req.params;

    const card = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Card ID" });
    }

    try{
        const updatedCard = await SpeechCard.findByIdAndUpdate(id, card, { new: true });
        res.status(200).json({ success: true, data: updatedCard });
    }
    catch(error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}