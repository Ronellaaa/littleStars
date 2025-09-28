import express from 'express';
import { createCard, getCardsByCategory, deleteCardById, updateCardById, getCategories, getAllCards  } from '../controllers/SpeechController.js';

const router = express.Router();

router.post("/", createCard);

router.delete("/:id", deleteCardById );

router.get("/categories/list", getCategories);

router.get("/:category", getCardsByCategory);

router.put("/:id", updateCardById );

router.get("/", getAllCards);

export default router;