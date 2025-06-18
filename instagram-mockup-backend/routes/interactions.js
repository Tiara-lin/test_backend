const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 資料 schema
const interactionSchema = new mongoose.Schema({
  userId: String,
  postId: String,
  type: String,
  timestamp: { type: Date, default: Date.now },
});

const Interaction = mongoose.model('Interaction', interactionSchema);

// POST /api/interactions
router.post('/', async (req, res) => {
  try {
    const interaction = new Interaction(req.body);
    await interaction.save();
    res.status(201).json(interaction);
  } catch (err) {
    res.status(400).json({ error: '無法儲存互動紀錄' });
  }
});

// GET /api/interactions
router.get('/', async (req, res) => {
  try {
    const interactions = await Interaction.find().sort({ timestamp: -1 });
    res.json(interactions);
  } catch (err) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
