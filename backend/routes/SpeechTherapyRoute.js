import express from 'express';
import { createCard, getCardsByCategory, deleteCardById, updateCardById } from '../controllers/SpeechController.js';

const router = express.Router();

router.post("/", createCard);

router.delete("/:id", deleteCardById );

router.get("/:category", getCardsByCategory);

router.put("/:id", updateCardById );

export default router;