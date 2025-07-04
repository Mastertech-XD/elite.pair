const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');

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
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
                },
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Safari")
            });

            // Pairing code request
            if (!sock.authState.creds.registered) {
                num = num.replace(/[^0-9]/g, '');
                console.log(`Requesting pairing code for ${num}`);
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            
            sock.ev.on("connection.update", async (update) => {
                console.log(`Connection state: ${update.connection}`);
                
                // When connection is fully open
                if (update.connection === "open") {
                    console.log('Connected successfully, preparing to send messages...');
                    await delay(3000); // Important stabilization delay

                    try {
                        const credsPath = __dirname + `/temp/${id}/creds.json`;
                        
                        // 1. Upload session file (REQUIRED)
                        console.log('Uploading session file...');
                        const mega_url = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                        const sessionCode = "mastertech~" + mega_url.replace('https://mega.nz/file/', '');
                        
                        // 2. Send session code (FIRST MESSAGE)
                        console.log('Sending session code...');
                        await sock.sendMessage(sock.user.id, { text: sessionCode });
                        
                        // 3. Send your beautiful welcome message (SECOND MESSAGE)
                        console.log('Sending welcome message...');
                        await sock.sendMessage(sock.user.id, { 
                            text: `🌟 *MASTERTECH-XD ACTIVATED* 🌟\n\n` +
                                  `╔══════════════════╗\n` +
                                  `║   🚀 CONNECTION SUCCESS!\n` +
                                  `╚══════════════════╝\n\n` +
                                  `📱 *Your Account:* ${sock.user.id.replace(/:\d+@/, '@')}\n` +
                                  `🛠️ *Platform:* ${sock.user.platform || 'Unknown'}\n\n` +
                                  `🔐 *Session Code Sent Above*\n` +
                                  `⚠️ Keep it secure and private!\n\n` +
                                  `👑 *Developer:* MASTERPEACE ELITE\n` +
                                  `💎 *Version:* 2.0 Elite Edition`,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MASTERTECH-XD",
                                    body: "Your elite WhatsApp solution",
                                    thumbnailUrl: "https://i.imgur.com/xyz1234.jpg",
                                    sourceUrl: "https://github.com/MASTERPEACE-ELITE",
                                    mediaType: 1
                                }
                            }
                        });

                        // 4. Final confirmation
                        await delay(1000);
                        await sock.sendMessage(sock.user.id, {
                            text: `✅ Setup complete! Bot will restart...`
                        });

                    } catch (e) {
                        console.error('Message sending error:', e);
                        await sock.sendMessage(sock.user.id, {
                            text: `⚠️ Error: ${e.message}`
                        });
                    } finally {
                        // Cleanup
                        await delay(2000);
                        await sock.ws.close();
                        await removeFile('./temp/' + id);
                        process.exit(0);
                    }
                }
                
                // Handle reconnections
                if (update.connection === "close" && update.lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log('Reconnecting...');
                    await delay(2000);
                    MASTERTECH_XD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.error('Initial error:', err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.status(500).send({ error: "Service unavailable" });
            }
        }
    }
    
    return MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
