const express = require('express');
const router = express.Router();

// Basic stub routes
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User routes not implemented yet'
  });
});

module.exports = router;