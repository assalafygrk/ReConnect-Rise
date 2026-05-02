const express = require('express');
const app = express();

app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Minimal Diagnostic API'
  });
});

// For compatibility with your current setup, we still try to load the server index
// but we catch any errors to prevent the whole function from crashing on startup
try {
  const serverApp = require('../server/index');
  app.use(serverApp);
} catch (error) {
  console.error('Failed to load server/index.js:', error.message);
}

module.exports = app;
