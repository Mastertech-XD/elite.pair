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
        console.log(`Starting pairing process for ${num || 'new session'}`);
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                syncFullHistory: false,
                browser: Browsers.macOS("Safari")
            });

            sock.ev.on('creds.update', saveCreds);
            
            sock.ev.on("connection.update", async (update) => {
                console.log('Connection update:', update.status);
                
                if (update.qr) {
                    console.log('QR code received');
                }

                // Handle pairing code request
                if (!sock.authState.creds.registered && update.connection === "connecting") {
                    try {
                        num = num.replace(/[^0-9]/g, '');
                        console.log(`Requesting pairing code for ${num}`);
                        const code = await sock.requestPairingCode(num);
                        if (!res.headersSent) {
                            res.send({ code });
                        }
                    } catch (pairingError) {
                        console.error('Pairing failed:', pairingError);
                        if (!res.headersSent) {
                            res.status(500).send({ error: "Pairing failed" });
                        }
                        throw pairingError;
                    }
                }

                // Connection successful
                if (update.connection === "open") {
                    console.log('Connection opened, preparing session...');
                    await delay(3000); // Stabilization delay

                    try {
                        const credsPath = __dirname + `/temp/${id}/creds.json`;
                        console.log('Uploading session file:', credsPath);
                        
                        // 1. Upload session file
                        const mega_url = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                        if (!mega_url) throw new Error("Upload returned no URL");
                        
                        // 2. Prepare session code
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        const sessionCode = "mastertech~" + string_session;
                        
                        // 3. Send welcome message
                        console.log('Sending welcome message...');
                        await sock.sendMessage(sock.user.id, {
                            text: `🌟 *MASTERTECH-XD ACTIVATED* 🌟\n\n` +
                                  `✅ Session successfully created!\n\n` +
                                  `📱 *Your Account:* ${sock.user.id.replace(/:\d+@/, '@')}\n` +
                                  `🖥️ *Platform:* ${sock.user.platform || 'Unknown'}\n\n` +
                                  `🔐 *Keep your session code secure!*`,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MASTERTECH-XD READY",
                                    body: "Your elite WhatsApp experience",
                                    thumbnailUrl: "https://i.imgur.com/xyz1234.jpg",
                                    sourceUrl: "https://github.com/MASTERPEACE-ELITE",
                                    mediaType: 1
                                }
                            }
                        });

                        // 4. Send session code
                        await delay(1000);
                        console.log('Sending session code...');
                        await sock.sendMessage(sock.user.id, { text: sessionCode });

                        // 5. Send final instructions
                        await delay(1000);
                        await sock.sendMessage(sock.user.id, {
                            text: `👑 *Creator:* MASTERPEACE ELITE\n` +
                                  `💻 *GitHub:* github.com/MASTERPEACE-ELITE\n` +
                                  `📢 *Updates:* whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A\n\n` +
                                  `The bot will now restart to finalize setup...`
                        });

                    } catch (sessionError) {
                        console.error('Session setup failed:', sessionError);
                        await sock.sendMessage(sock.user.id, {
                            text: `❌ Setup Error:\n${sessionError.message}\n\nPlease try again.`
                        });
                    } finally {
                        // Cleanup with delays
                        await delay(3000);
                        console.log('Cleaning up session...');
                        await sock.ws.close();
                        await removeFile('./temp/' + id);
                        console.log('Process exiting...');
                        process.exit(0);
                    }
                }

                // Handle connection failures
                if (update.connection === "close") {
                    const shouldReconnect = update.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log(`Connection closed, should reconnect: ${shouldReconnect}`);
                    
                    if (shouldReconnect) {
                        await delay(1000);
                        MASTERTECH_XD_PAIR_CODE();
                    }
                }
            });

        } catch (initError) {
            console.error('Initialization error:', initError);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.status(500).send({ error: "Service unavailable" });
            }
        }
    }

    return MASTERTECH_XD_PAIR_CODE().catch(err => {
        console.error('Pairing process failed:', err);
        if (!res.headersSent) {
            res.status(500).send({ error: "Pairing process failed" });
        }
    });
});

module.exports = router;
