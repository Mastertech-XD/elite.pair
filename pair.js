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
    let num = req.query.number;
    
    async function MASTERTECH_XD_PAIR_CODE() {
        console.log(`Starting pairing for ${num}`);
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino()),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Browsers.macOS("Safari")
            });

            // Critical: This ensures WhatsApp detects pairing
            sock.ev.on('creds.update', saveCreds);

            if (!sock.authState.creds.registered) {
                await delay(2000); // Important delay
                num = num.replace(/[^0-9]/g, '');
                console.log(`Requesting pairing code for ${num}`);
                
                try {
                    const code = await sock.requestPairingCode(num);
                    console.log(`Pairing code generated: ${code}`);
                    
                    if (!res.headersSent) {
                        res.send({ code });
                    }
                } catch (pairError) {
                    console.error('Pairing failed:', pairError);
                    if (!res.headersSent) {
                        res.status(500).send({ error: "Pairing request failed" });
                    }
                    return;
                }
            }

            sock.ev.on("connection.update", async (update) => {
                console.log(`Connection update: ${update.connection}`);
                
                if (update.connection === "open") {
                    console.log('Connection successful, preparing session...');
                    await delay(3000); // Stabilization delay

                    try {
                        const credsPath = __dirname + `/temp/${id}/creds.json`;
                        console.log('Uploading session file...');
                        
                        const mega_url = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                        const sessionCode = "mastertech~" + mega_url.replace('https://mega.nz/file/', '');
                        
                        console.log('Sending session code...');
                        await sock.sendMessage(sock.user.id, { text: sessionCode });

                        console.log('Sending welcome message...');
                        await sock.sendMessage(sock.user.id, {
                            text: `🌟 *MASTERTECH-XD ACTIVATED* 🌟\n\n` +
                                  `✅ Session successfully created!\n\n` +
                                  `📱 Your Account: ${sock.user.id.replace(/:\d+@/, '@')}\n` +
                                  `🖥️ Platform: ${sock.user.platform || 'Unknown'}\n\n` +
                                  `🔐 Keep your session code secure!`,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MASTERTECH-XD",
                                    thumbnailUrl: "https://i.imgur.com/xyz1234.jpg",
                                    sourceUrl: "https://github.com/MASTERPEACE-ELITE"
                                }
                            }
                        });

                    } catch (e) {
                        console.error('Message failed:', e);
                    } finally {
                        await delay(2000);
                        await sock.ws.close();
                        await removeFile('./temp/' + id);
                        process.exit(0);
                    }
                }
                else if (update.connection === "close") {
                    console.log('Connection closed, reconnecting...');
                    await delay(2000);
                    MASTERTECH_XD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.error('Initialization error:', err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.status(500).send({ error: "Service unavailable" });
            }
        }
    }

    return MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
