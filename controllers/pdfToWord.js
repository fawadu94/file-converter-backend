const path = require('path');
const fs = require('fs');
const { convertWithLibreOffice } = require('../services/libreoffice');

const pdfToWord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = path.resolve(req.file.path);
    const outputDir = path.resolve('outputs');
    const outputFileName = path.basename(inputPath, path.extname(inputPath)) + '.docx';
    const outputPath = path.join(outputDir, outputFileName);

    await convertWithLibreOffice(inputPath, outputDir, 'docx');

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: 'Conversion failed - output not found' });
    }

    res.json({
      success: true,
      message: 'PDF converted to Word successfully',
      downloadUrl: `http://localhost:3000/outputs/${outputFileName}`,
      fileName: outputFileName
    });

    fs.unlinkSync(inputPath);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { pdfToWord };