const express = require('express');
const router = express.Router();
const { startInterview, sendMessage, endInterview, getInterviews, getInterview } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/start', startInterview);
router.get('/', getInterviews);
router.get('/:id', getInterview);
router.post('/:id/message', sendMessage);
router.post('/:id/end', endInterview);

module.exports = router;
