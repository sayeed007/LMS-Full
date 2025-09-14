const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Article routes not implemented yet'
  });
});

module.exports = router;