const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const knownGestures = [
  { code: 'HELLO', label: 'Hello / Hi' },
  { code: 'THANKS', label: 'Thank you' },
  { code: 'YES', label: 'Yes' },
  { code: 'NO', label: 'No' },
  { code: 'PLEASE', label: 'Please' },
  { code: 'STOP', label: 'Stop' },
  { code: 'HELP', label: 'Help' },
];

router.get('/', authMiddleware, (req, res) => {
  res.json({ gestures: knownGestures });
});

router.post('/log', authMiddleware, (req, res) => {
  const { gesture } = req.body;
  if (!gesture) {
    return res.status(400).json({ message: 'Gesture is required' });
  }

  console.log(`User ${req.user.email} logged gesture: ${gesture}`);
  res.status(201).json({ message: 'Gesture logged', gesture });
});

module.exports = router;
