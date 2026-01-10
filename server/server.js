const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sendNotification } = require('./telegramBot');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes Placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bromoul Server is running' });
});

app.post('/api/notify', async (req, res) => {
  const { message } = req.body;
  const result = await sendNotification(message);
  res.json(result);
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
