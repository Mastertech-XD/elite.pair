const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");
const {
    default: MASTER_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore
} = require("maher-zubair-baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    if (!num || !num.match(/\d/g)) {
        return res.status(400).send({ error: "Invalid phone number" });
    }

    async function MASTERTECH_XD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
        let Pair_Code_By_Elite_Tech;

        try {
            Pair_Code_By_Elite_Tech = MASTER_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: "silent" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: ["Chrome (Linux)", "", ""],
                connectTimeoutMs: 60000
            });

            Pair_Code_By_Elite_Tech.ev.on('creds.update', saveCreds);

            Pair_Code_By_Elite_Tech.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === "open") {
                    console.log("✅ Connected to WhatsApp");

                    if (!Pair_Code_By_Elite_Tech.authState.creds.registered) {
                        num = num.replace(/[^0-9]/g, '');
                        try {
                            const code = await Pair_Code_By_Elite_Tech.requestPairingCode(num);
                            console.log("Pairing code generated:", code);
                            
                            if (!res.headersSent) {
                                return res.send({ code });
                            }
                        } catch (err) {
                            console.error("Failed to generate pairing code:", err);
                            if (!res.headersSent) {
                                return res.status(500).send({ error: "Failed to generate pairing code" });
                            }
                        }
                    }
                } else if (connection === "close") {
                    console.log("❌ Connection closed", lastDisconnect?.error);
                    await removeFile(`./temp/${id}`);
                }
            });

            // Handle errors that might occur during pairing code request
            Pair_Code_By_Elite_Tech.ev.on("creds.update", () => {
                // This ensures we don't close the connection too early
            });

        } catch (err) {
            console.error("Initialization error:", err);
            if (Pair_Code_By_Elite_Tech?.ws) await Pair_Code_By_Elite_Tech.ws.close();
            await removeFile(`./temp/${id}`);
            
            if (!res.headersSent) {
                return res.status(500).send({ 
                    error: "Initialization failed",
                    message: err.message 
                });
            }
        }
    }

    // Timeout after 2 minutes
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).send({ error: "Pairing timed out" });
        }
    }, 120000);

    try {
        await MASTERTECH_XD_PAIR_CODE();
    } catch (err) {
        console.error("Outer error:", err);
        if (!res.headersSent) {
            res.status(500).send({ error: "Server error" });
        }
    } finally {
        clearTimeout(timeout);
    }
});

module.exports = router;
