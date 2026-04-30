const path = require('path');
const fs = require('fs');
const { convertWithLibreOffice } = require('../services/libreoffice');

const SERVER_URL = 'https://file-converter-backend-production.up.railway.app';

const pptToPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const inputPath = path.resolve(req.file.path);
    const outputDir = path.resolve('outputs');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputFileName = path.basename(inputPath, path.extname(inputPath)) + '.pdf';
    const outputPath = path.join(outputDir, outputFileName);

    await convertWithLibreOffice(inputPath, outputDir, 'pdf');

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: 'Conversion failed - output not found' });
    }

    const downloadUrl = `${SERVER_URL}/outputs/${outputFileName}`;
    res.json({ success: true, downloadUrl, fileName: outputFileName });

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { pptToPdf };