const Game = require('../models/Game');

// Get all games
exports.getGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new game
exports.addGame = async (req, res) => {
  try {
    const { title, description, image, url } = req.body;
    const game = new Game({ title, description, image, url });
    await game.save();
    res.status(201).json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a game
exports.deleteGame = async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: 'Game deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};