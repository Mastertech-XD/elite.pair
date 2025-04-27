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
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

// Configure logger for better debugging
const logger = pino({ level: 'debug' }).child({ module: 'pairing-code' });

// Improved file removal function
async function removeFile(FilePath) {
    try {
        if (!fs.existsSync(FilePath)) return false;
        fs.rmSync(FilePath, { recursive: true, force: true });
        return true;
    } catch (err) {
        logger.error(`Failed to remove ${FilePath}: ${err}`);
        return false;
    }
}

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    // Validate phone number
    if (!num || !/^[\d+]+$/.test(num)) {
        return res.status(400).json({ error: "Invalid phone number format" });
    }

    num = num.replace(/[^0-9]/g, '');
    const authDir = path.join(tempDir, id);

    try {
        logger.debug(`Starting pairing process for ${num}`);
        
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        
        const socket = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger: logger,
            browser: Browsers.ubuntu('Chrome'),
            syncFullHistory: false,
            connectTimeoutMs: 60_000
        });

        // Set response timeout
        res.setTimeout(120000, () => {
            if (!res.headersSent) {
                res.status(504).json({ error: "Request timeout" });
                socket.end(undefined);
                removeFile(authDir);
            }
        });

        socket.ev.on('creds.update', saveCreds);

        socket.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === "open") {
                logger.debug("Connection established");
                
                try {
                    if (!socket.authState.creds.registered) {
                        await delay(2000);
                        const code = await socket.requestPairingCode(num);
                        
                        if (!res.headersSent) {
                            return res.json({ 
                                success: true,
                                code: code,
                                message: "Pairing code generated successfully"
                            });
                        }
                    }

                    // Session data handling
                    const credsPath = path.join(authDir, 'creds.json');
                    await delay(1000);
                    
                    if (fs.existsSync(credsPath)) {
                        const data = fs.readFileSync(credsPath);
                        const b64data = Buffer.from(data).toString('base64');
                        
                        const session = await socket.sendMessage(
                            socket.user.id, 
                            { text: b64data }
                        );

                        const successMessage = `
*Pair Code Connected by Elite-Tech*
*Made With ❤️*
______________________________________
╔════◇
║ *『 YOU'VE CHOSEN ELITE-TECH 』*
║ WhatsApp Bot Deployment Started
╚════════════════════════╝
╔═════◇
║  『••• CONTACT & RESOURCES •••』
║❒ *Owner:* https://wa.me/254743727510
║❒ *Repo:* https://github.com/Elite-Tech/elite-tech
║❒ *Channel:* https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D
║❒ *Plugins:* https://github.com/Elite-Tech/elite-tech-plugins
╚════════════════════════╝
_____________________________________`;

                        await socket.sendMessage(
                            socket.user.id,
                            { text: successMessage },
                            { quoted: session }
                        );
                    }

                } catch (innerError) {
                    logger.error("Error in connection handling:", innerError);
                    if (!res.headersSent) {
                        res.status(500).json({ error: "Internal processing error" });
                    }
                } finally {
                    await socket.end();
                    await removeFile(authDir);
                }
                
            } else if (connection === "close") {
                logger.debug("Connection closed", lastDisconnect?.error);
                
                if (lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(10_000);
                    await removeFile(authDir);
                }
            }
        });

    } catch (err) {
        logger.error("Initialization failed:", err);
        await removeFile(authDir);
        
        if (!res.headersSent) {
            const status = err.message.includes('timeout') ? 504 : 500;
            res.status(status).json({ 
                error: "Failed to initialize pairing",
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    }
});

module.exports = router;
