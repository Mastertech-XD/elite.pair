import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import pino from 'pino';
import {
    default as MasterpeaceEliteBot,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioUrls = [
    "https://files.catbox.moe/hpwsi2.mp3",
    "https://files.catbox.moe/xci982.mp3"
];

async function removeFile(filePath) {
    try {
        await fs.access(filePath);
        await fs.rm(filePath, { recursive: true, force: true });
    } catch (err) {
        console.error(`Cleanup error: ${filePath}`, err.message);
    }
}

export default async (req, res) => {
    const id = crypto.randomBytes(16).toString('hex');
    let num = req.query.number;
    const tempDir = path.join(__dirname, 'temp', id);

    if (!num || !/^\+?[\d]{10,15}$/.test(num)) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }

    num = num.replace(/\D/g, '');

    try {
        await fs.mkdir(tempDir, { recursive: true });
        const { state, saveCreds } = await useMultiFileAuthState(tempDir);
        let botInstance = null;

        try {
            botInstance = MasterpeaceEliteBot({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }),
                browser: ['Chrome (Linux)', '', '']
            });

            if (!botInstance.authState.creds.registered) {
                await delay(1000);
                const code = await botInstance.requestPairingCode(num);
                res.json({ code });

                botInstance.ev.on('creds.update', saveCreds);
                
                botInstance.ev.on('connection.update', async (update) => {
                    const { connection } = update;
                    if (connection === 'open') {
                        try {
                            await delay(3000);
                            const credsPath = path.join(tempDir, 'creds.json');
                            const data = await fs.readFile(credsPath);
                            const b64data = Buffer.from(data).toString('base64');
                            
                            await botInstance.sendMessage(
                                botInstance.user.id,
                                { text: `SESSION_${b64data}` }
                            );
                            
                            await delay(500);
                            await botInstance.ws.close();
                        } finally {
                            await removeFile(tempDir);
                        }
                    }
                });

                req.on('close', async () => {
                    if (botInstance?.ws) {
                        await botInstance.ws.close();
                    }
                    await removeFile(tempDir);
                });
            }
        } catch (err) {
            console.error('Bot error:', err);
            if (botInstance?.ws) {
                await botInstance.ws.close();
            }
            await removeFile(tempDir);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Bot operation failed' });
            }
        }
    } catch (err) {
        console.error('Setup error:', err);
        await removeFile(tempDir);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Setup failed' });
        }
    }
};
