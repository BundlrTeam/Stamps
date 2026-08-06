const express = require('express');
const router = express.Router();
const stampController = require('../controllers/stamp.controller');

router.get('/stamps', stampController.getStamps);
router.post('/stamps', stampController.addStamp);

module.exports = router;
