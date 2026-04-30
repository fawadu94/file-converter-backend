const { exec } = require('child_process');
const path = require('path');

const convertWithLibreOffice = (inputPath, outputDir, format = 'pdf') => {
  return new Promise((resolve, reject) => {

    // ✅ Works on both Windows (local) and Linux (Railway server)
    const isWindows = process.platform === 'win32';
    const libreOfficePath = isWindows
      ? '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"'
      : 'libreoffice';

    const command = `${libreOfficePath} --headless --convert-to ${format} "${inputPath}" --outdir "${outputDir}"`;

    console.log('Running command:', command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('LibreOffice error:', stderr);
        return reject(new Error('Conversion failed: ' + stderr));
      }
      console.log('LibreOffice output:', stdout);
      resolve(stdout);
    });
  });
};

module.exports = { convertWithLibreOffice };