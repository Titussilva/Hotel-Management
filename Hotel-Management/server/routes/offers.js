import express from 'express';
import Offer from '../models/Offer.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const now = new Date();
  const offers = await Offer.find({
    active: true,
    $or: [{ validTo: { $exists: false } }, { validTo: { $gte: now } }],
  }).sort({ createdAt: -1 });

  res.json(offers);
});

router.post('/validate', async (req, res) => {
  const offer = await Offer.findOne({ code: String(req.body.code || '').toUpperCase(), active: true });
  if (!offer) return res.status(404).json({ message: 'Offer code not found' });
  res.json(offer);
});

export default router;
