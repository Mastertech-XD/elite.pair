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
        console.log(`Starting pairing process for ${num || 'new device'}`);
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
                browser: Browsers.macOS("Safari"),
                markOnlineOnConnect: true
            });

            // Handle credentials updates
            sock.ev.on('creds.update', saveCreds);

            // Request pairing code if not registered
            if (!sock.authState.creds.registered) {
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
                    return;
                }
            }

            // Connection handler
            sock.ev.on("connection.update", async (update) => {
                console.log('Connection state:', update.connection);
                
                // Successful connection
                if (update.connection === "open") {
                    console.log('Connection established, preparing session...');
                    await delay(3000); // Extra stabilization delay

                    try {
                        const credsPath = __dirname + `/temp/${id}/creds.json`;
                        console.log('Uploading session file:', credsPath);
                        
                        // 1. Upload session to Mega
                        const mega_url = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                        if (!mega_url) throw new Error("Mega upload failed");
                        
                        // 2. Prepare session code
                        const sessionCode = "mastertech~" + mega_url.replace('https://mega.nz/file/', '');
                        console.log('Session code generated');

                        // 3. Send session code (FIRST MESSAGE)
                        console.log('Sending session code...');
                        await sock.sendMessage(sock.user.id, { text: sessionCode });

                        // 4. Send welcome message (SECOND MESSAGE)
                        console.log('Sending welcome message...');
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

👑 *Creator:* MASTERPEACE ELITE
💻 *GitHub:* github.com/MASTERPEACE-ELITE
📢 *Updates:* whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A

✨ *Session Ready!* ✨
🔐 Keep your session code secure!`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: welcomeMsg,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MASTERTECH-XD CONNECTED",
                                    body: "Your elite WhatsApp experience",
                                    thumbnailUrl: "https://i.imgur.com/xyz1234.jpg",
                                    sourceUrl: "https://github.com/MASTERPEACE-ELITE",
                                    mediaType: 1
                                }
                            }
                        });

                        console.log('All messages sent successfully!');

                    } catch (e) {
                        console.error('Message sending failed:', e);
                        try {
                            await sock.sendMessage(sock.user.id, { 
                                text: `❌ Error: ${e.message}\n\nPlease contact support.`
                            });
                        } catch (err) {
                            console.error('Could not send error message:', err);
                        }
                    } finally {
                        // Cleanup
                        console.log('Cleaning up...');
                        await delay(2000);
                        await sock.ws.close();
                        await removeFile('./temp/' + id);
                        process.exit(0);
                    }
                }

                // Handle reconnection
                if (update.connection === "close") {
                    const shouldReconnect = update.lastDisconnect?.error?.output?.statusCode !== 401;
                    console.log(`Connection closed, ${shouldReconnect ? 'reconnecting' : 'logged out'}`);
                    
                    if (shouldReconnect) {
                        await delay(2000);
                        MASTERTECH_XD_PAIR_CODE();
                    }
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
