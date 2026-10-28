const express = require('express');
const router = express.Router();
const qaFeedbackController = require('../controllers/qaFeedbackController');

// Submit new feedback / issue report
router.post('/', qaFeedbackController.createFeedback);

// Fetch all feedback (filter by status, type, severity, route)
router.get('/', qaFeedbackController.getAllFeedback);

// Fetch next pending issue for autonomous resolution
router.get('/next', qaFeedbackController.getNextPending);

// Fetch single report by ID
router.get('/:id', qaFeedbackController.getFeedbackById);

// Update status & resolution notes
router.patch('/:id', qaFeedbackController.updateFeedback);

// Delete report
router.delete('/:id', qaFeedbackController.deleteFeedback);

module.exports = router;
