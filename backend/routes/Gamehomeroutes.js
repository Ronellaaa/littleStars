const express = require('express');
const router = express.Router();
const GamesController = require('../controllers/GamesController');

router.get('/', GamesController.getGames);
router.post('/add', GamesController.addGame);
router.delete('/delete/:id', GamesController.deleteGame);

module.exports = router;