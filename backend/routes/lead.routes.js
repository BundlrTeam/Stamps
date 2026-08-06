const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const authMiddleware = require('../auth.middleware');

router.post('/', leadController.upsertLead);
router.get('/:email', authMiddleware, leadController.getLeadByEmail);
router.delete('/:email', authMiddleware, leadController.deleteLead);

module.exports = router;
