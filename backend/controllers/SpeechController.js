import SpeechCard from '../models/SpeechCard.model.js';
import mongoose from 'mongoose';

export const createCard = async (req, res) => {
    const card = req.body; // Expecting { title, category, image }

    if(!card.title || !card.category || !card.image ) { // Validate required fields
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newSpeechCard = new SpeechCard(card); // Create new instance

    try {
        await newSpeechCard.save(); // Save to DB
        res.status(201).json({ success: true, data: newSpeechCard }); // Return created card
    }
    catch (error) {
        console.error("Error creating speech card:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const getCardsByCategory = async (req, res) => {
    const { category } = req.params; // Get category from URL params
    console.log(`Fetching cards for category: ${category}`); // Debug log

    try{
        const cards = await SpeechCard.find({ category: category }); // Query DB for cards in this category
        res.status(200).json({ success: true, data:cards }); // Return found cards
    }

    catch(error) {
        res.status(500).json({ success: false, message: "Server Error"});
    }

}

export const deleteCardById = async (req, res) => {
    const { id } = req.params; // Get card ID from URL params

    if(!mongoose.Types.ObjectId.isValid(id)) { // Validate ID format
        return res.status(404).json({ success: false, message: "Invalid Card ID" });
    }

    try{
        await SpeechCard.findByIdAndDelete(id); // Delete card by ID
        res.status(200).json({ success: true, message: "Card deleted successfully" });
    }
    catch(error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const updateCardById = async (req, res) => {
    const { id } = req.params; // Get card ID from URL params

    const card = req.body; // Expecting { title, category, image }

    if(!mongoose.Types.ObjectId.isValid(id)) { // Validate ID format
        return res.status(404).json({ success: false, message: "Invalid Card ID" });
    }

    try{
        const updatedCard = await SpeechCard.findByIdAndUpdate(id, card, { new: true }); // Update and return new doc
        res.status(200).json({ success: true, data: updatedCard });// Return updated card
    }
    catch(error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const getCategories = (req, res) => {
  try {
    // Access the enum values from schema
    const categories = SpeechCard.schema.path("category").enumValues;
    res.json({ success: true, data: categories }); // Return categories as JSON
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📦 Get ALL Speech Cards (no filtering by category)
export const getAllCards = async (req, res) => {
  try {
    const cards = await SpeechCard.find(); // fetch every document
    res.status(200).json({ success: true, data: cards });
  } catch (error) {
    console.error("Error fetching all cards:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
