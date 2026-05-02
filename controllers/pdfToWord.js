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
    const docxPath = path.join(outputDir, baseName + '.docx');

    // Path to our python script
    const scriptPath = path.resolve(__dirname, '../services/convert_pdf.py');

    console.log('Input PDF:', inputPath);
    console.log('Output DOCX:', docxPath);
    console.log('Script:', scriptPath);

    // Use pdf2docx Python library
    await new Promise((resolve, reject) => {
      const cmd = `python3 "${scriptPath}" "${inputPath}" "${docxPath}"`;
      console.log('Running:', cmd);

      exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
        if (err) {
          return reject(new Error('Python conversion failed: ' + stderr));
        }
        resolve(stdout);
      });
    });

    // Verify output exists
    if (!fs.existsSync(docxPath)) {
      const files = fs.readdirSync(outputDir);
      console.log('Files in output dir:', files);
      return res.status(500).json({ error: 'Conversion failed - output not found' });
    }

    const downloadUrl = `${SERVER_URL}/outputs/${baseName}.docx`;

    res.json({
      success: true,
      message: 'PDF converted to Word successfully',
      downloadUrl,
      fileName: baseName + '.docx'
    });

    // Cleanup input file
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

  } catch (error) {
    console.error('pdfToWord error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { pdfToWord };