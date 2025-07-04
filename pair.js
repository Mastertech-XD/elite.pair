const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    Browsers 
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number.replace(/[^0-9]/g, '');

    async function MASTERTECH_XD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
        
        try {
            const sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: state.keys,
                },
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Browsers.macOS('Safari')
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;

                // Handle pairing code request
                if (!state.creds.registered && connection === "connecting") {
                    try {
                        console.log(`Requesting pairing code for ${num}`);
                        const code = await sock.requestPairingCode(num);
                        if (!res.headersSent) {
                            res.send({ code });
                        }
                    } catch (error) {
                        console.error('Pairing error:', error);
                        if (!res.headersSent) {
                            res.status(500).send({ error: "Pairing failed" });
                        }
                    }
                }

                // Connection successful
                if (connection === "open") {
                    console.log('Connection successful, preparing session...');
                    await delay(3000);

                    try {
                        const credsPath = `${__dirname}/temp/${id}/creds.json`;
                        console.log('Uploading session file...');
                        
                        // 1. Upload session
                        const mega_url = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                        const sessionCode = `mastertech~${mega_url.replace('https://mega.nz/file/', '')}`;

                        // 2. Send session code
                        await sock.sendMessage(sock.user.id, { text: sessionCode });

                        // 3. Send welcome message
                        const welcomeMsg = `
🌟 *𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗!* 🌟

┏━━━━━━━━━━━━━━━━━━━┓
┃  🚀 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗢𝗡 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!  
┗━━━━━━━━━━━━━━━━━━━┛

📛 *Account:* ${sock.user.id.replace(/:\d+@/, '@')}
🖥️ *Platform:* ${sock.user.platform || 'Unknown'}

┏━━━━━━━━━━━━━━━━━━━┓
┃  🔗 𝗘𝗦𝗦𝗘𝗡𝗧𝗜𝗔𝗟 𝗟𝗜𝗡𝗞𝗦  
┗━━━━━━━━━━━━━━━━━━━┛

👑 *Developer:* MASTERPEACE ELITE
💻 *GitHub:* github.com/MASTERPEACE-ELITE
📢 *Updates:* whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A

✨ *Your session is ready!* ✨
`;
                        await sock.sendMessage(sock.user.id, {
                            text: welcomeMsg,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MASTERTECH-XD",
                                    body: "Connected successfully!",
                                    thumbnailUrl: "https://i.imgur.com/xyz1234.jpg",
                                    sourceUrl: "https://github.com/MASTERPEACE-ELITE",
                                    mediaType: 1
                                }
                            }
                        });

                    } catch (e) {
                        console.error('Message send error:', e);
                    } finally {
                        await delay(2000);
                        await sock.ws.close();
                        removeFile(`./temp/${id}`);
                        process.exit(0);
                    }
                }

                // Handle reconnections
                if (connection === "close") {
                    if (lastDisconnect.error?.output?.statusCode !== 401) {
                        await delay(2000);
                        MASTERTECH_XD_PAIR_CODE();
                    }
                }
            });

        } catch (err) {
            console.error('Initialization error:', err);
            removeFile(`./temp/${id}`);
            if (!res.headersSent) {
                res.status(500).send({ error: "Service error" });
            }
        }
    }

    return MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
