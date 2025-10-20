const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', GameSchema);