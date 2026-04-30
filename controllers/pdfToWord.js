const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const SERVER_URL = 'https://file-converter-backend-production.up.railway.app';

const pdfToWord = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const inputPath = path.resolve(req.file.path);
    const outputDir = path.resolve('outputs');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const baseName = path.basename(inputPath, path.extname(inputPath));
    const isWindows = process.platform === 'win32';
    const soffice = isWindows
      ? '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"'
      : 'libreoffice';

    // Step 1: PDF → ODT
    await new Promise((resolve, reject) => {
      exec(
        `${soffice} --headless --convert-to odt "${inputPath}" --outdir "${outputDir}"`,
        { timeout: 60000 },
        (err, stdout, stderr) => {
          console.log('Step1 stdout:', stdout);
          console.log('Step1 stderr:', stderr);
          if (err) return reject(new Error('PDF to ODT failed: ' + stderr));
          resolve(stdout);
        }
      );
    });

    const odtPath = path.join(outputDir, baseName + '.odt');

    // Step 2: ODT → DOCX
    await new Promise((resolve, reject) => {
      exec(
        `${soffice} --headless --convert-to docx "${odtPath}" --outdir "${outputDir}"`,
        { timeout: 60000 },
        (err, stdout, stderr) => {
          console.log('Step2 stdout:', stdout);
          console.log('Step2 stderr:', stderr);
          if (err) return reject(new Error('ODT to DOCX failed: ' + stderr));
          resolve(stdout);
        }
      );
    });

    if (fs.existsSync(odtPath)) fs.unlinkSync(odtPath);

    const docxPath = path.join(outputDir, baseName + '.docx');

    if (!fs.existsSync(docxPath)) {
      return res.status(500).json({ error: 'Conversion failed - output not found' });
    }

    const downloadUrl = `${SERVER_URL}/outputs/${baseName}.docx`;
    res.json({ success: true, downloadUrl, fileName: baseName + '.docx' });

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

  } catch (error) {
    console.error('pdfToWord error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { pdfToWord };