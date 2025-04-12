const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8000;
const __path = process.cwd();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "files.catbox.moe"],
            connectSrc: ["'self'"],
            mediaSrc: ["'self'", "files.catbox.moe"],
            fontSrc: ["'self'", "fonts.gstatic.com"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 
        ['https://yourdomain.com'] : 
        ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.disable('x-powered-by');

// Rate Limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: process.env.RATE_LIMIT || 15,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static Files
app.use(express.static(path.join(__path, 'public'), {
    setHeaders: (res) => {
        res.set('X-Content-Type-Options', 'nosniff');
    }
});

// Routes
const qrRouter = require('./qr');
const pairRouter = require('./pair');

app.use('/api/qr', qrRouter);
app.use('/api/pair', pairRouter);

// HTML Routes
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, 'pair.html'), {
        headers: {
            'X-Frame-Options': 'DENY'
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__path, 'main.html'), {
        headers: {
            'X-Frame-Options': 'DENY'
        }
    });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__path, '500.html'));
});

// 404 Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__path, '404.html'));
});

// Server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

module.exports = app;
