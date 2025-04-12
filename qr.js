import QRCode from 'qrcode';
import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import pino from 'pino';
import { makeid } from './id.js';
import {
    default as MasterpeaceEliteBot,
    useMultiFileAuthState,
    jidNormalizedUser,
    Browsers,
    delay,
} from '@whiskeysockets/baileys';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

async function removeFile(filePath) {
    try {
        await fs.access(filePath);
        await fs.rm(filePath, { recursive: true, force: true });
    } catch (err) {
        console.error(`Cleanup error for ${filePath}:`, err.message);
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    const tempDir = path.join(__dirname, 'temp', id);

    try {
        await fs.mkdir(tempDir, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(tempDir);
        let botInstance = null;

        try {
            botInstance = MasterpeaceEliteBot({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });

            botInstance.ev.on('creds.update', saveCreds);
            
            botInstance.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;

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
                        await delay(3000);
                        const credsPath = path.join(tempDir, 'creds.json');
                        const data = await fs.readFile(credsPath);
                        const b64data = Buffer.from(data).toString('base64');

                        const session = await botInstance.sendMessage(
                            botInstance.user.id, 
                            { text: 'MASTERPEACE-SESSION;;;' + b64data }
                        );

                        const sessionMessage = `*Session Connected ✅*\n\nBy _Masterpeace Elite_\n\n╭──『 *MASTERTECH-MD BOT* 』\n│ Session linked successfully\n╰───────────────────────`;
                        
                        await botInstance.sendMessage(
                            botInstance.user.id, 
                            { text: sessionMessage }, 
                            { quoted: session }
                        );

                        await delay(500);
                        await botInstance.ws.close();
                    } catch (err) {
                        console.error('Session transfer error:', err);
                    } finally {
                        await removeFile(tempDir);
                    }
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log('Connection closed unexpectedly');
                    await delay(10000);
                    if (botInstance?.ws) {
                        await botInstance.ws.close();
                    }
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Connection closed' });
                    }
                }
            });

            req.on('close', async () => {
                if (botInstance?.ws) {
                    await botInstance.ws.close();
                }
                await removeFile(tempDir);
            });

        } catch (err) {
            console.error('Bot initialization error:', err);
            if (botInstance?.ws) {
                await botInstance.ws.close();
            }
            await removeFile(tempDir);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Initialization failed' });
            }
        }
    } catch (err) {
        console.error('Setup error:', err);
        await removeFile(tempDir);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Setup failed' });
        }
    }
});

export default router;
