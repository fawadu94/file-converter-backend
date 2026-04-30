const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const convertRoutes = require('./routes/convert');

const app = express();

// ✅ Railway sets PORT automatically (8080), this handles both local and Railway
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/outputs', express.static(path.join(__dirname, 'outputs')));
app.use('/api/convert', convertRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'File Converter API is running!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});