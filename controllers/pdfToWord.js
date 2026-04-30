const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const pdfToWord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = path.resolve(req.file.path);
    const outputDir = path.resolve('outputs');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // LibreOffice converts PDF → ODT first, then ODT → DOCX
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const odtPath = path.join(outputDir, baseName + '.odt');
    const docxPath = path.join(outputDir, baseName + '.docx');

    const isWindows = process.platform === 'win32';
    const soffice = isWindows
      ? '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"'
      : 'libreoffice';

    // Step 1: PDF → ODT
    await new Promise((resolve, reject) => {
      const cmd = `${soffice} --headless --convert-to odt "${inputPath}" --outdir "${outputDir}"`;
      console.log('Step 1 cmd:', cmd);
      exec(cmd, { timeout: 60000 }, (err, stdout, stderr) => {
        if (err) return reject(new Error('PDF to ODT failed: ' + stderr));
        resolve(stdout);
      });
    });

    // Step 2: ODT → DOCX
    await new Promise((resolve, reject) => {
      const cmd = `${soffice} --headless --convert-to docx "${odtPath}" --outdir "${outputDir}"`;
      console.log('Step 2 cmd:', cmd);
      exec(cmd, { timeout: 60000 }, (err, stdout, stderr) => {
        if (err) return reject(new Error('ODT to DOCX failed: ' + stderr));
        resolve(stdout);
      });
    });

    // Cleanup ODT
    if (fs.existsSync(odtPath)) fs.unlinkSync(odtPath);

    if (!fs.existsSync(docxPath)) {
      const files = fs.readdirSync(outputDir);
      console.log('Files in output:', files);
      return res.status(500).json({ error: 'Conversion failed - output not found', files });
    }

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const downloadUrl = `${protocol}://${host}/outputs/${baseName}.docx`;

    res.json({
      success: true,
      message: 'PDF converted to Word successfully',
      downloadUrl,
      fileName: baseName + '.docx'
    });

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

  } catch (error) {
    console.error('❌ pdfToWord error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { pdfToWord };