const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { wordToPdf } = require('../controllers/wordToPdf');
const { pptToPdf } = require('../controllers/pptToPdf');
const { pdfToWord } = require('../controllers/pdfToWord');

// POST /api/convert/word-to-pdf
router.post('/word-to-pdf', upload.single('file'), wordToPdf);

// POST /api/convert/ppt-to-pdf
router.post('/ppt-to-pdf', upload.single('file'), pptToPdf);

// POST /api/convert/pdf-to-word
router.post('/pdf-to-word', upload.single('file'), pdfToWord);

module.exports = router;