const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");
const {
    default: Wasi_Tech,
    useMultiFileAuthState,
    Browsers,
    delay
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    
    async function WASI_MD_QR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let Qr_Code_By_Wasi_Tech = Wasi_Tech({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.ubuntu("Chrome"),
            });

            Qr_Code_By_Wasi_Tech.ev.on('creds.update', saveCreds);
            Qr_Code_By_Wasi_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                
                if (qr) {
                    try {
                        const qrBuffer = await QRCode.toBuffer(qr);
                        res.type('png').send(qrBuffer);
                    } catch (err) {
                        console.error("QR generation error:", err);
                        res.status(500).json({ error: "Failed to generate QR" });
                    }
                }
                
                if (connection === "open") {
                    await delay(5000);
                    try {
                        let data = fs.readFileSync(path.join(__dirname, `./temp/${id}/creds.json`));
                        let b64data = Buffer.from(data).toString('base64');
                        
                        await Qr_Code_By_Wasi_Tech.sendMessage(
                            Qr_Code_By_Wasi_Tech.user.id, 
                            { text: b64data }
                        );

                        const WASI_MD_TEXT = `...`; // Your existing message
                        
                        await Qr_Code_By_Wasi_Tech.sendMessage(
                            Qr_Code_By_Wasi_Tech.user.id,
                            { text: WASI_MD_TEXT }
                        );

                        await Qr_Code_By_Wasi_Tech.ws.close();
                        removeFile(`./temp/${id}`);
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
            removeFile(`./temp/${id}`);
            if (!res.headersSent) {
                res.status(500).json({ error: "Connection failed" });
            }
        }
    }
    
    WASI_MD_QR_CODE();
});

module.exports = router;
