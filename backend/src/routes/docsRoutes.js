const express = require('express');
const docsController = require('../controllers/docsController');
const router = express.Router();

router.get('/erd', docsController.getERD);

module.exports = router;
