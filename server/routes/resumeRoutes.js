const express = require('express');
const router = express.Router();
const {
  upload, uploadResume, getResumes, getResume, deleteResume, compareResumes, buildResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.post('/build', buildResume);
router.post('/compare', compareResumes);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

module.exports = router;
