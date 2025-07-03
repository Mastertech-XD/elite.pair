const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI({
    'api_dev_key': '1DnoOkf5Grx4euI_JnQjpVxDoUE79bep',
    'api_user_name': 'YOUR_PASTEBIN_USERNAME',
    'api_user_password': 'YOUR_PASTEBIN_PASSWORD'
});

const { makeid } = require('./utils/id');
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

// Configure logger
const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: true
        }
    }
});

// Utility functions
const utils = {
    removeFile: (filePath) => {
        if (!fs.existsSync(filePath)) return false;
        try {
            fs.rmSync(filePath, { recursive: true, force: true });
            return true;
        } catch (err) {
            logger.error(`Failed to remove file ${filePath}: ${err.message}`);
            return false;
        }
    },
    
    validatePhoneNumber: (num) => {
        if (!num) return false;
        const cleaned = num.replace(/[^0-9]/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    },
    
    ensureTempDir: () => {
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
    }
};

// Pairing handler
router.get('/', async (req, res) => {
    utils.ensureTempDir();
    const sessionId = makeid();
    let phoneNumber = req.query.number;

    // Validate input
    if (!utils.validatePhoneNumber(phoneNumber)) {
        logger.warn(`Invalid phone number format: ${phoneNumber}`);
        return res.status(400).json({
            success: false,
            message: "Invalid phone number format. Use digits only in international format (without + or 00)"
        });
    }

    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    try {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${sessionId}`);
        
        const socketConfig = {
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger: logger,
            browser: Browsers.ubuntu('Chrome'),
            syncFullHistory: false,
            markOnlineOnConnect: false
        };

        const waSocket = makeWASocket(socketConfig);

        // Event handlers
        waSocket.ev.on('creds.update', saveCreds);

        waSocket.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "open") {
                logger.info(`Connected to WhatsApp for session ${sessionId}`);
                
                try {
                    // Wait for full sync
                    await delay(10000);
                    
                    // Read and encode session data
                    const credsPath = path.join(__dirname, `temp/${sessionId}/creds.json`);
                    const data = fs.readFileSync(credsPath);
                    const b64data = Buffer.from(data).toString('base64');
                    
                    // Send session to user
                    const sessionMsg = await waSocket.sendMessage(
                        waSocket.user.id, 
                        { text: `Your session data:\n${b64data}` }
                    );

                    // Send welcome message
                    const welcomeMsg = `
*Pairing Successful with Elite-Tech*

╔════════════════════════╗
║  ✅ CONNECTION ESTABLISHED
╚════════════════════════╝

• *Bot Name:* ${waSocket.user.name || 'Not Set'}
• *Phone:* ${waSocket.user.id.replace(/:\d+@/, '@')}
• *Platform:* ${waSocket.user.platform || 'Unknown'}

╔════════════════════════╗
║  📌 IMPORTANT LINKS
╚════════════════════════╝
• Owner: https://wa.me/254743727510
• GitHub: https://github.com/Elite-Tech
• Channel: https://whatsapp.com/channel/0029VahusSh0QeaoFzHJCk2x

_This session will automatically backup to Pastebin_`;

                    await waSocket.sendMessage(
                        waSocket.user.id, 
                        { text: welcomeMsg },
                        { quoted: sessionMsg }
                    );

                    // Backup to Pastebin
                    try {
                        const paste = await pastebin.createPaste({
                            text: b64data,
                            title: `WhatsApp Session ${sessionId}`,
                            format: 'json',
                            privacy: 1, // Unlisted
                            expire_date: '1D'
                        });

                        await waSocket.sendMessage(
                            waSocket.user.id,
                            { text: `📌 Session Backup URL:\n${paste}` }
                        );
                        logger.info(`Session backup created: ${paste}`);
                    } catch (pasteError) {
                        logger.error(`Pastebin backup failed: ${pasteError.message}`);
                        await waSocket.sendMessage(
                            waSocket.user.id,
                            { text: '⚠️ Failed to create session backup on Pastebin' }
                        );
                    }
                } catch (syncError) {
                    logger.error(`Session sync failed: ${syncError.message}`);
                }
            } 
            else if (connection === "close") {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                logger.warn(`Connection closed. ${shouldReconnect ? 'Will' : 'Will not'} reconnect`, {
                    error: lastDisconnect?.error
                });

                if (shouldReconnect) {
                    await delay(10000);
                    utils.removeFile(`./temp/${sessionId}`);
                    return router(req, res); // Retry
                }
            }
        });

        if (!waSocket.authState.creds.registered) {
            await delay(1500);
            
            try {
                const pairingCode = await waSocket.requestPairingCode(phoneNumber);
                logger.info(`Generated pairing code for ${phoneNumber}`);
                
                return res.json({
                    success: true,
                    sessionId,
                    pairingCode,
                    message: "Pairing code generated successfully"
                });
            } catch (pairError) {
                logger.error(`Pairing failed for ${phoneNumber}: ${pairError.message}`);
                utils.removeFile(`./temp/${sessionId}`);
                
                return res.status(500).json({
                    success: false,
                    message: "Failed to generate pairing code",
                    error: pairError.message
                });
            }
        }
    } catch (err) {
        logger.error(`Critical error in pairing process: ${err.message}`);
        utils.removeFile(`./temp/${sessionId}`);
        
        return res.status(500).json({
            success: false,
            message: "Internal server error during pairing",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Cleanup endpoint
router.delete('/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    if (!sessionId || sessionId.length !== 16) {
        return res.status(400).json({ success: false, message: "Invalid session ID" });
    }

    try {
        const removed = utils.removeFile(`./temp/${sessionId}`);
        return res.json({
            success: removed,
            message: removed ? "Session cleaned up" : "Session not found"
        });
    } catch (err) {
        logger.error(`Cleanup failed for ${sessionId}: ${err.message}`);
        return res.status(500).json({ success: false, message: "Cleanup failed" });
    }
});

module.exports = router;
