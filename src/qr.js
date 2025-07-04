const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    
    async function WASI_MD_QR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, `./temp/${id}`));
        
        try {
            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.ubuntu("Chrome")
            });

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr) {
                    try {
                        const qrBuffer = await QRCode.toBuffer(qr);
                        res.type('png').send(qrBuffer);
                    } catch (err) {
                        console.error("QR generation error:", err);
                        if (!res.headersSent) {
                            res.status(500).json({ error: "Failed to generate QR" });
                        }
                    }
                }
                
                if (connection === "open") {
                    await delay(5000);
                    try {
                        let data = fs.readFileSync(path.join(__dirname, `./temp/${id}/creds.json`));
                        let b64data = Buffer.from(data).toString('base64');
                        
                        let session = await sock.sendMessage(sock.user.id, { text: b64data });

                        const WASI_MD_TEXT = `
╔══════════════════════╗
  🚀 MASTERTECH-MD 🚀
╚══════════════════════╝

✅ SUCCESSFULLY CONNECTED!

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
👑 Creator: Masterpeace Elite
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
📢 Channel: whatsapp.com/channel/0029Vaz...
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
📞 Contact: wa.me/254743727510
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
💻 GitHub: github.com/mastertech-md
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
© ${new Date().getFullYear()} | All Rights Reserved`;

                        await sock.sendMessage(
                            sock.user.id,
                            { text: WASI_MD_TEXT },
                            { quoted: session }
                        );

                        await sock.ws.close();
                        removeFile(path.join(__dirname, `./temp/${id}`));
                    } catch (err) {
                        console.error("Session save error:", err);
                    }
                } else if (
                    connection === "close" &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode !== 401
                ) {
                    await delay(10000);
                    WASI_MD_QR_CODE();
                }
            });
        } catch (err) {
            console.error("Connection error:", err);
            removeFile(path.join(__dirname, `./temp/${id}`));
            if (!res.headersSent) {
                res.status(500).json({ error: "Connection failed" });
            }
        }
    }
    
    WASI_MD_QR_CODE();
});

module.exports = router;
