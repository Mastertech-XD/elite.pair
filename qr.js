const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const pino = require("pino");
const { makeid } = require('./id');
const {
    default: MasterpeaceEliteBot,
    useMultiFileAuthState,
    jidNormalizedUser,
    Browsers,
    delay,
} = require("@whiskeysockets/baileys");

const router = express.Router();

async function removeFile(filePath) {
    try {
        await fs.access(filePath);
        await fs.rm(filePath, { recursive: true, force: true });
    } catch (err) {
        // File doesn't exist or already removed
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    const tempDir = path.join(__dirname, 'temp', id);

    try {
        await fs.mkdir(tempDir, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(tempDir);

        let botInstance = MasterpeaceEliteBot({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: Browsers.macOS("Desktop"),
        });

        botInstance.ev.on('creds.update', saveCreds);
        
        botInstance.ev.on("connection.update", async (s) => {
            const { connection, lastDisconnect, qr } = s;

            if (qr) {
                try {
                    const qrImage = await QRCode.toBuffer(qr);
                    res.setHeader('Content-Type', 'image/png');
                    res.send(qrImage);
                } catch (err) {
                    console.error('QR generation error:', err);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'QR generation failed' });
                    }
                }
            }

            if (connection === "open") {
                try {
                    await delay(5000);
                    const credsPath = path.join(tempDir, 'creds.json');
                    const data = await fs.readFile(credsPath);
                    const b64data = Buffer.from(data).toString('base64');

                    const session = await botInstance.sendMessage(
                        botInstance.user.id, 
                        { text: 'MASTERPEACE-SESSION;;;' + b64data }
                    );

                    const sessionMessage = `
*Session Connected ✅*
Enjoy 😺
By _Masterpeace Elite_
______________________________

╭──『 *MASTERTECH-MD BOT* 』
│ You've successfully linked your session.
│ Ready to deploy your bot.
╰───────────────────────

🌟 Visit for Support:
❍ *GitHub:* [Mastertech-MD Repository](https://mastertech-md/Mastertech)
❍ *WhatsApp Channel:* [Click Here](https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D)
❍ *Owner:* [Contact Me](https://wa.me/254743727510)
                    `;

                    await botInstance.sendMessage(
                        botInstance.user.id, 
                        { text: sessionMessage }, 
                        { quoted: session }
                    );

                    await botInstance.ws.close();
                } catch (err) {
                    console.error('Session transfer error:', err);
                } finally {
                    await removeFile(tempDir);
                }
            } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                await delay(10000);
                botInstance = null;
                await removeFile(tempDir);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Connection closed unexpectedly' });
                }
            }
        });

        req.on('close', async () => {
            if (botInstance && botInstance.ws) {
                await botInstance.ws.close();
            }
            await removeFile(tempDir);
        });

    } catch (err) {
        console.error('QR session error:', err);
        await removeFile(tempDir);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Session initialization failed' });
        }
    }
});

module.exports = router;
