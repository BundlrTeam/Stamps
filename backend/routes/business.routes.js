const express = require('express');
const router = express.Router();
const businessController = require('../controllers/business.controller');

router.get('/businesses', businessController.getBusinesses);
router.get('/approved-businesses/:id', businessController.getApprovedBusinessById);
router.post('/approved-businesses', businessController.upsertApprovedBusiness);
router.delete('/approved-businesses/:id', businessController.deleteApprovedBusiness);

module.exports = router;
