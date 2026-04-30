const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const convertRoutes = require('./routes/convert');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve output files as static (for download)
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// Routes
app.use('/api/convert', convertRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'File Converter API is running!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});