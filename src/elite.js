const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");

// Configuration
const PORT = process.env.PORT || 10000;
const __path = process.cwd();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__path, 'public')));

// Import routers
const qrRouter = require('./src/qr');
const pairRouter = require('./src/pair');

// Routes
app.use('/server', qrRouter);
app.use('/code', pairRouter);

// HTML routes
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, 'public/pair.html'));
});

app.get('/qr', (req, res) => {
    res.sendFile(path.join(__path, 'public/qr.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__path, 'public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`
╔══════════════════════╗
  MASTERTECH-MD RUNNING
╚══════════════════════╝
➤ Server running on port ${PORT}
➤ Pair Code: /pair
➤ QR Code: /qr
➤ Health Check: /health
`);
});
