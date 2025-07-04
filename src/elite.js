const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");

// Import routers
const qrRouter = require('./qr');
const pairRouter = require('./pair');

// Configuration
const PORT = process.env.PORT || 5000;
const __path = process.cwd();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__path, 'public')));

// Routes
app.use('/server', qrRouter);
app.use('/code', pairRouter);

// HTML routes
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, 'pair.html'));
});

app.get('/qr', (req, res) => {
    res.sendFile(path.join(__path, 'qr.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__path, 'index.html'));
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
➤ Server running on http://localhost:${PORT}
➤ Pair Code: /pair
➤ QR Code: /qr
`);
});

module.exports = app;
