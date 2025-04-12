const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;
const __path = process.cwd();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.disable('x-powered-by');

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body Parser Configuration
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Static Files Middleware
app.use(express.static(path.join(__path, 'public')));

// Routes
const serverRoutes = require('./qr');
const codeRoutes = require('./code'); // Renamed from 'pair' for clarity

app.use('/api/qr', serverRoutes);
app.use('/api/code', codeRoutes);

// HTML Routes
app.get('/pair', (req, res) => {
  res.sendFile(path.join(__path, 'pair.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__path, 'main.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__path, '404.html'));
});

// Server Initialization
const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════╗
  ║                                  ║
  ║   Server running on port ${PORT}     ║
  ║                                  ║
  ╚══════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app;
