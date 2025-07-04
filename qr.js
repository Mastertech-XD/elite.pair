const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    
    async function MASTERTECH_XD_QR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop")
            });
            
            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                
                if (qr) {
                    const qrImage = await QRCode.toBuffer(qr);
                    if (!res.headersSent) {
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': qrImage.length
                        });
                        res.end(qrImage);
                    }
                }

                if (connection == "open") {
                    await delay(3000);
                    let rf = __dirname + `/temp/${id}/creds.json`;
                    
                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "mastertech~" + string_session;
                        
                        const welcomeMsg = `
✨ *𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗!* ✨

┏━━━━━━━━━━━━━━━━━━━┓
┃  🎉 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗔𝗕𝗢𝗔𝗥𝗗!  
┗━━━━━━━━━━━━━━━━━━━┛

📛 *Bot ID:* ${sock.user.id.replace(/:\d+@/, '@')}
📊 *Platform:* ${sock.user.platform || 'Unknown'}

┏━━━━━━━━━━━━━━━━━━━┓
┃  🔐 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗗𝗨𝗖𝗖𝗘𝗦𝗦  
┗━━━━━━━━━━━━━━━━━━━┛

Your session credentials are now securely stored.
Keep this information safe and private.

👑 *Developer:* MASTERPEACE ELITE
💎 *Version:* 2.0 Elite Edition
`;

                        await sock.sendMessage(sock.user.id, { 
                            text: welcomeMsg,
                            contextInfo: {
                                externalAdReply: {
                                    title: "MASTERTECH-XD READY",
                                    body: "Premium WhatsApp Bot Solution",
                                    thumbnailUrl: "https://i.imgur.com/xyz1234.jpg",
                                    sourceUrl: "https://github.com/MASTERPEACE-ELITE",
                                    mediaType: 1
                                }
                            }
                        });

                        await sock.sendMessage(sock.user.id, { text: md });

                    } catch (e) {
                        console.error("Error:", e);
                        await sock.sendMessage(sock.user.id, { text: `❌ Error: ${e.message}` });
                    }

                    await delay(100);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`✅ Session for ${sock.user.id} completed successfully`);
                    process.exit();
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(1000);
                    MASTERTECH_XD_QR_CODE();
                }
            });
        } catch (err) {
            console.error("Error:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.status(500).send("❗ Service Error");
            }
        }
    }
    await MASTERTECH_XD_QR_CODE();
});

module.exports = router;
