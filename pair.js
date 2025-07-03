const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");
const {
    default: Mastertech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

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
            message: "Invalid number. Please provide a valid WhatsApp number with country code."
        });
    }

    async function MASTERTECH_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let MastertechBot = Mastertech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" })),
                browser: ["Mastertech-MD", "Desktop", "1.0.0"]
            });

            if (!MastertechBot.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await MastertechBot.requestPairingCode(num);
                
                if (!res.headersSent) {
                    return res.json({ 
                        status: true,
                        pairingCode: code,
                        instructions: `Open WhatsApp on the phone with number ${num}, go to Menu > Linked Devices > Link a Device, and enter this code: ${code}`
                    });
                }
            }

            MastertechBot.ev.on('creds.update', saveCreds);
            MastertechBot.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect } = update;
                
                if (connection === "open") {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    
                    // Send session credentials
                    let sessionMsg = await MastertechBot.sendMessage(
                        MastertechBot.user.id, 
                        { 
                            text: `🔐 *YOUR SESSION CREDENTIALS* 🔐\n\n` +
                                  `*DO NOT SHARE THIS WITH ANYONE!*\n\n` +
                                  `${b64data}\n\n` +
                                  `This is your session data. Keep it safe to restore your connection.`
                        }
                    );

                    // Send beautiful formatted note
                    const MASTERTECH_TEXT = `
╔══════════════════════╗
  🚀 *MASTERTECH-MD* 🚀
╚══════════════════════╝

✅ *Successfully Connected!*

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
🌟 *Creator:* Masterpeace Elite
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
📢 *Channel:* https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
📞 *Contact:* https://wa.me/254743727510
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
💻 *GitHub:* https://github.com/mastertech-md
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

© ${new Date().getFullYear()} Masterpeace Elite | All Rights Reserved`;

                    await MastertechBot.sendMessage(
                        MastertechBot.user.id,
                        { 
                            text: MASTERTECH_TEXT,
                            linkPreview: true
                        },
                        { quoted: sessionMsg }
                    );

                    // Close connection and clean up
                    await delay(100);
                    await MastertechBot.ws.close();
                    removeFile('./temp/' + id);
                    
                    // If HTTP request still open, send success
                    if (!res.headersSent) {
                        return res.json({
                            status: true,
                            message: "Successfully paired! Check your WhatsApp for session details."
                        });
                    }
                } else if (
                    connection === "close" &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode !== 401
                ) {
                    await delay(10000);
                    MASTERTECH_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Pairing error:", err);
            removeFile('./temp/' + id);
            
            if (!res.headersSent) {
                return res.status(500).json({ 
                    status: false,
                    message: "Pairing service error",
                    error: err.message
                });
            }
        }
    }

    return MASTERTECH_MD_PAIR_CODE();
});

module.exports = router;
