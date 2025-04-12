const PastebinAPI = require('pastebin-js');
const { makeid } = require('./id');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pino = require('pino');
const {
    default: MasterpeaceEliteBot,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} = require('maher-zubair-baileys');

// Restored all original audio URLs exactly
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

// Restored original padding function
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Enhanced file removal with logging
function removeFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true, force: true });
            console.log(`[CLEANUP] Removed ${filePath}`);
        }
    } catch (err) {
        console.error(`[ERROR] Cleanup failed: ${err.message}`);
    }
}

// Restored original routing with security additions
module.exports = async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    // Security: Validate phone number format
    if (!/^[\d+]{10,15}$/.test(num)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    async function MASTERTECH_MD_PAIR_CODE() {
        const tempDir = path.join('./temp', id);
        const { state, saveCreds } = await useMultiFileAuthState(tempDir);

        try {
            const Pair_Code_By_Masterpeace_Elite = MasterpeaceEliteBot({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }),
                browser: ['Chrome (Linux)', '', '']
            });

            if (!Pair_Code_By_Masterpeace_Elite.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Masterpeace_Elite.requestPairingCode(num);

                if (!res.headersSent) {
                    res.json({ code });
                }

                Pair_Code_By_Masterpeace_Elite.ev.on('creds.update', saveCreds);
                Pair_Code_By_Masterpeace_Elite.ev.on('connection.update', async (s) => {
                    const { connection, lastDisconnect } = s;
                    
                    if (connection === 'open') {
                        await delay(5000);
                        const credsPath = path.join(tempDir, 'creds.json');
                        
                        // Original encoding logic preserved
                        const data = fs.readFileSync(credsPath);
                        let b64data = Buffer.from(data).toString('base64');
                        let finalSessionCode = `${b64data}${generateRandomString(530 - b64data.length)}`;

                        // Restored original messaging flow
                        const session = await Pair_Code_By_Masterpeace_Elite.sendMessage(
                            Pair_Code_By_Masterpeace_Elite.user.id, 
                            { text: finalSessionCode }
                        );

                        // Restored exact confirmation message
                        const confirmationMessage = `✅ *Session Successfully Linked!*\n\n🔑 *Session Code:* \`${finalSessionCode}\`\n\n📞 *Contact:* +254743727510\n🌐 *GitHub:* [Mastertech-MD](https://github.com/mastertech-md)`;
                        await Pair_Code_By_Masterpeace_Elite.sendMessage(
                            Pair_Code_By_Masterpeace_Elite.user.id, 
                            { text: confirmationMessage },
                            { quoted: session }
                        );

                        // Restored random audio sending
                        const randomAudio = audioUrls[Math.floor(Math.random() * audioUrls.length)];
                        await Pair_Code_By_Masterpeace_Elite.sendMessage(
                            Pair_Code_By_Masterpeace_Elite.user.id,
                            {
                                audio: { url: randomAudio },
                                mimetype: randomAudio.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg',
                                ptt: true,
                                contextInfo: {
                                    externalAdReply: {
                                        title: 'MASTERTECH-MD',
                                        body: 'Your session is ready!',
                                        thumbnailUrl: 'https://files.catbox.moe/v38p4r.jpeg',
                                        sourceUrl: 'https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D'
                                    }
                                }
                            },
                            { quoted: session }
                        );

                        await Pair_Code_By_Masterpeace_Elite.ws.close();
                        removeFile(tempDir);
                    }
                });
            }
        } catch (err) {
            console.error('[SESSION ERROR]', err);
            removeFile(tempDir);
            if (!res.headersSent) {
                res.status(500).json({ code: 'Service Unavailable' });
            }
        }
    }

    // Timeout protection (new addition)
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).json({ error: 'Session timeout' });
        }
    }, 300000); // 5 minutes

    await MASTERTECH_MD_PAIR_CODE().finally(() => clearTimeout(timeout));
};
