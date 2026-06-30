const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');

router.post('/', leadController.upsertLead);
router.get('/:email', leadController.getLeadByEmail);
router.delete('/:email', leadController.deleteLead);

module.exports = router;
