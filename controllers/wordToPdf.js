const path = require('path');
const fs = require('fs');
const { convertWithLibreOffice } = require('../services/libreoffice');

const wordToPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = path.resolve(req.file.path);
    const outputDir = path.resolve('outputs');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = path.basename(inputPath, path.extname(inputPath)) + '.pdf';
    const outputPath = path.join(outputDir, outputFileName);

    await convertWithLibreOffice(inputPath, outputDir, 'pdf');

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: 'Conversion failed - output not found' });
    }

    // ✅ Use the actual host from request headers (works for both Railway and local)
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const downloadUrl = `${protocol}://${host}/outputs/${outputFileName}`;

    res.json({
      success: true,
      message: 'Converted successfully',
      downloadUrl,
      fileName: outputFileName
    });

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { wordToPdf };