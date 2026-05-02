const express = require('express');
const app = express();

let startupError = null;
try {
  const serverApp = require('../server/index');
  app.use(serverApp);
} catch (error) {
  startupError = {
    message: error.message,
    stack: error.stack
  };
  console.error('Failed to load server/index.js:', error.message);
}

app.get('/api/ping', (req, res) => {
  res.json({ 
    status: startupError ? 'error' : 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Minimal Diagnostic API',
    startupError: startupError
  });
});

module.exports = app;
