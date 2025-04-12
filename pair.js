const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const pino = require('pino');
const {
    default: MasterpeaceEliteBot,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

const audioUrls = [
    "https://files.catbox.moe/hpwsi2.mp3",
    "https://files.catbox.moe/xci982.mp3",
    "https://files.catbox.moe/utbujd.mp3",
    "https://files.catbox.moe/w2j17k.m4a",
    "https://files.catbox.moe/851skv.m4a",
    "https://files.catbox.moe/qnhtbu.m4a",
    "https://files.catbox.moe/lb0x7w.mp3",
    "https://files.catbox.moe/efmcxm.mp3",
    "https://files.catbox.moe/gco5bq.mp3",
    "https://files.catbox.moe/26oeeh.mp3"
];

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}

async function removeFile(filePath) {
    try {
        await fs.access(filePath);
        await fs.rm(filePath, { recursive: true, force: true });
    } catch (err) {
        // File doesn't exist or already removed
    }
}

module.exports = async (req, res) => {
    const id = req.id || crypto.randomBytes(16).toString('hex');
    let num = req.query.number;

    if (!num || !/^\+?[\d]{10,15}$/.test(num)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    num = num.replace(/[^0-9]/g, '');
    const tempDir = path.join(__dirname, 'temp', id);

    try {
        await fs.mkdir(tempDir, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(tempDir);

        const botInstance = MasterpeaceEliteBot({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
            },
            printQRInTerminal: false,
            logger: pino({ level: 'fatal' }),
            browser: ['Chrome (Linux)', '', '']
        });

        if (!botInstance.authState.creds.registered) {
            await delay(1500);
            const code = await botInstance.requestPairingCode(num);
            
            res.json({ code });

            botInstance.ev.on('creds.update', saveCreds);
            
            botInstance.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                
                if (connection === 'open') {
                    try {
                        await delay(5000);
                        const credsPath = path.join(tempDir, 'creds.json');
                        const data = await fs.readFile(credsPath);
                        const b64data = Buffer.from(data).toString('base64');
                        const finalSessionCode = `${b64data}${generateRandomString(530 - b64data.length)}`;

                        const session = await botInstance.sendMessage(
                            botInstance.user.id, 
                            { text: finalSessionCode }
                        );

                        const confirmationMessage = `✅ *Session Successfully Linked!*\n\n🔑 *Session Code:* \`${finalSessionCode}\`\n\n📞 *Contact:* +254743727510\n🌐 *GitHub:* [Mastertech-MD](https://github.com/mastertech-md)`;
                        
                        await botInstance.sendMessage(
                            botInstance.user.id, 
                            { text: confirmationMessage },
                            { quoted: session }
                        );

                        const randomAudio = audioUrls[Math.floor(Math.random() * audioUrls.length)];
                        await botInstance.sendMessage(
                            botInstance.user.id,
                            {
                                audio: { url: randomAudio },
                                mimetype: randomAudio.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg',
                                ptt: true
                            },
                            { quoted: session }
                        );

                    } catch (err) {
                        console.error('Session transfer error:', err);
                    } finally {
                        await botInstance.ws.close();
                        await removeFile(tempDir);
                    }
                } else if (connection === 'close' && lastDisconnect?.error) {
                    await botInstance.ws.close();
                    await removeFile(tempDir);
                }
            });

            req.on('close', async () => {
                await botInstance.ws.close();
                await removeFile(tempDir);
            });
        }
    } catch (err) {
        console.error('Pairing error:', err);
        await removeFile(tempDir);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Pairing failed' });
        }
    }
};
