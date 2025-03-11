
const express = require('express');
const { create, Whatsapp } = require('venom-bot');
const app = express();
__path = process.cwd();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

// Initialize WhatsApp bot with session persistence
create({
    session: 'session-name',
    headless: true,
    useChrome: false,
    catchQR: (qrCode, asciiQR) => {
        console.log('⚡ QR Code Received. Scan to pair:');
        console.log(asciiQR);
    },
    statusFind: (statusSession) => {
        console.log('🔄 Session Status:', statusSession);
    },
    autoClose: 0 // Keeps the session open indefinitely
})
    .then(client => startBot(client))
    .catch(error => console.error('❌ Error starting bot:', error));

function startBot(client) {
    console.log("✅ WhatsApp bot is active and connected.");

    client.onStateChange((state) => {
        console.log('🔄 State changed:', state);
        if (['CONFLICT', 'UNLAUNCHED', 'SYNCING'].includes(state)) {
            console.log('⚠️ Syncing issue detected. Attempting to fix...');
            client.forceRefocus();
        }
    });

    client.onMessage(async (message) => {
        if (message.body === '!ping') {
            await client.sendText(message.from, 'Pong! ✅ Bot is active.');
        }
    });

    client.onIncomingCall((call) => {
        client.sendText(call.peerJid, '⚠️ Please do not call. Use text instead.');
    });
}

// Express Server
app.listen(PORT, () => {
    console.log(`🌍 Server running on http://localhost:` + PORT);
});

module.exports = app;
