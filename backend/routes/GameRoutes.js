import express from 'express';
import Game from '../models/Game.js';

const router = express.Router();

// ADD game
router.post('/add', async (req, res) => {
  try {
    const {
      title,
      description,
      ageGroup,
      rating,
      difficultyLevel,
      category,
      Game_image,
      Game_URL,
    } = req.body;

    const newGame = new Game({
      title,
      description,
      ageGroup,
      rating: Number(rating),
      difficultyLevel,
      category,
      Game_image,
      Game_URL,
    });

    await newGame.save();
    res.status(201).json({ status: 'Game Added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Error adding game', error: err.message });
  }
});

// GET all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Error fetching games', error: err.message });
  }
});

// UPDATE game
router.put('/update/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    const {
      title,
      description,
      ageGroup,
      rating,
      difficultyLevel,
      category,
      Game_image,
      Game_URL,
    } = req.body;

    const updateGame = {
      title,
      description,
      ageGroup,
      rating,
      difficultyLevel,
      category,
      Game_image,
      Game_URL,
    };

    await Game.findByIdAndUpdate(gameId, updateGame, { new: true });
    res.status(200).json({ status: 'Game updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Error updating game', error: err.message });
  }
});

// DELETE game
router.delete('/delete/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    await Game.findByIdAndDelete(gameId);
    res.status(200).json({ status: 'Game deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Error deleting game', error: err.message });
  }
});

// GET game by ID
router.get('/get/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ status: 'Game not found' });
    }
    res.status(200).json({ status: 'Game fetched', game });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Error fetching game', error: err.message });
  }
});

export default router;
