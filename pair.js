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
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS("Safari")
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                
                if (connection == "open") {
                    await delay(5000); // Wait for full connection
                    let rf = __dirname + `/temp/${id}/creds.json`;
                    
                    try {
                        // 1. Upload session file
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let sessionCode = "mastertech~" + string_session;

                        // 2. Send session code first
                        await sock.sendMessage(sock.user.id, { text: sessionCode });

                        // 3. Send your beautiful formatted message
                        const welcomeMsg = `
🌟 *𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗!* 🌟

┏━━━━━━━━━━━━━━━━━━━┓
┃  🚀 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗢𝗡 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!  
┗━━━━━━━━━━━━━━━━━━━┛

📛 *Bot Name:* ${sock.user.name || 'Not Configured'}
📱 *Phone:* ${sock.user.id.replace(/:\d+@/, '@')}
🖥️ *Platform:* ${sock.user.platform || 'Unknown'}

┏━━━━━━━━━━━━━━━━━━━┓
┃  🔗 𝗘𝗦𝗦𝗘𝗡𝗧𝗜𝗔𝗟 𝗟𝗜𝗡𝗞𝗦  
┗━━━━━━━━━━━━━━━━━━━┛

👑 *Creator:* MASTERPEACE ELITE
💻 *GitHub:* github.com/MASTERPEACE-ELITE
📢 *Updates:* whatsapp.com/channel/0029VbA6MSYJUM2TVOzCSb2A

✨ *Session Ready!* ✨
🔐 Your credentials are securely stored.
`;

                        await sock.sendMessage(sock.user.id, {
                            text: welcomeMsg,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MASTERTECH-XD CONNECTED",
                                    body: "Your elite WhatsApp experience starts now!",
                                    thumbnailUrl: "https://i.imgur.com/xyz1234.jpg",
                                    sourceUrl: "https://github.com/MASTERPEACE-ELITE",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        });

                    } catch (e) {
                        console.error("Error:", e);
                        await sock.sendMessage(sock.user.id, { 
                            text: `⚠️ Error during setup:\n${e.message}`
                        });
                    }

                    // Cleanup
                    await delay(2000);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    process.exit(0);
                } 
                else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(1000);
                    MASTERTECH_XD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Initialization error:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.status(500).send({ error: "Service unavailable" });
            }
        }
    }
    return MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
