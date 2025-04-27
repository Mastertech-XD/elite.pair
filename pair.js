const express = require('express');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const router = express.Router();

// Auth folder setup
const authFolder = './auth_info';
if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);

router.get('/', async (req, res) => {
    const number = req.query.number?.replace(/\D/g, '');
    if (!number) return res.status(400).send('Missing phone number');

    try {
        const { state, saveCreds } = await useMultiFileAuthState(authFolder);
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            browser: ["Chrome (Linux)", "", ""]
        });

        sock.ev.on('connection.update', async (update) => {
            if (update.connection === 'open') {
                console.log('✅ Connected to WhatsApp');
                
                if (!sock.authState.creds.registered) {
                    const pairingCode = await sock.requestPairingCode(number);
                    res.send({ code: pairingCode });
                }

                // Send welcome message after successful pairing
                const welcomeMessage = `
                *Pairing Successful!* 🎉

                *Elite-Tech WhatsApp Bot*
                ───────────────────
                • Owner: https://wa.me/254743727510
                • GitHub: https://github.com/Elite-Tech
                • Channel: https://whatsapp.com/channel/0029VahusSh0QeaoFzHJCk2x
                ───────────────────
                _Bot is now active!_`;

                await sock.sendMessage(
                    sock.user.id, 
                    { text: welcomeMessage }
                );

                sock.ev.on('creds.update', saveCreds);
            }
            
            if (update.connection === 'close') {
                console.log('❌ Connection closed');
            }
        });

        // Cleanup on process exit
        process.on('exit', () => sock.end());

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Pairing failed');
    }
});

module.exports = router;
