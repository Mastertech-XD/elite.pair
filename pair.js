const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    if (!num || num.replace(/[^0-9]/g, '').length < 11) {
        return res.status(400).json({ 
            status: false,
            message: "Invalid WhatsApp number. Please include country code."
        });
    }

    async function MASTERTECH_XD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, `./temp/${id}`));
        
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" })),
                browser: Browsers.ubuntu("Chrome")
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                
                if (!res.headersSent) {
                    return res.json({
                        status: true,
                        number: `+${num}`,
                        pairingCode: code,
                        instructions: "Open WhatsApp → Linked Devices → Enter this code"
                    });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect } = update;
                
                if (connection === "open") {
                    await delay(5000);
                    try {
                        let data = fs.readFileSync(path.join(__dirname, `./temp/${id}/creds.json`));
                        let rf = path.join(__dirname, `./temp/${id}/creds.json`);
                        
                        // Upload session to MEGA
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "masterpeace~" + string_session;
                        
                        // Send session to user
                        let code = await sock.sendMessage(sock.user.id, { text: md });
                        
                        // Success message
                        let desc = `*Hey there, Mastertech-XD User!* 👋🏻

Thanks for using *MASTERTECH-XD* — your session has been successfully created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share this ID with anyone.

——————

*✅ Stay Updated:*  
Join our official WhatsApp Channel:  
https://whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A

*💻 Source Code:*  
Fork & explore the project on GitHub:  
https://github.com/XdKing2/MALVIN-XD

——————

> *© Powered by Masterpeace Elite*
Stay cool and hack smart. ✌🏻`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MASTERTECH-XD",
                                    thumbnailUrl: "https://files.catbox.moe/bqs70b.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }  
                            }
                        }, { quoted: code });

                        await sock.ws.close();
                        removeFile(path.join(__dirname, `./temp/${id}`));
                        
                        if (!res.headersSent) {
                            res.json({ 
                                status: true,
                                message: "Device successfully paired!" 
                            });
                        }
                    } catch (e) {
                        console.error("Session upload error:", e);
                        await sock.sendMessage(sock.user.id, { text: e.toString() });
                        
                        let errorDesc = `Hey there, MASTERTECH-XD User! 👋🏻

⚠️ *Session created but upload failed!*
We've sent you the error details above.

——————

*Need help?* Contact support:
https://wa.me/254743727510`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: errorDesc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MASTERTECH-XD ERROR",
                                    thumbnailUrl: "https://i.imgur.com/GVW7aoD.jpeg",
                                    sourceUrl: "https://whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A",
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }  
                            }
                        });

                        if (!res.headersSent) {
                            res.status(500).json({
                                status: false,
                                message: "Pairing completed but upload failed"
                            });
                        }
                    }
                } else if (
                    connection === "close" &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode !== 401
                ) {
                    await delay(10000);
                    MASTERTECH_XD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Pairing error:", err);
            removeFile(path.join(__dirname, `./temp/${id}`));
            
            if (!res.headersSent) {
                res.status(500).json({ 
                    status: false,
                    message: "Pairing failed",
                    error: err.message 
                });
            }
        }
    }
    
    MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
