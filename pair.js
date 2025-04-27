const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('1DnoOkf5Grx4euI_JnQjpVxDoUE79bep')
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
    default: MASTER_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
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
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        let Pair_Code_By_Elite_Tech;

        try {
            Pair_Code_By_Elite_Tech = MASTER_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "silent" }).child({ level: "silent" }),
                // 👇 Force Chrome (Linux) as the browser
                browser: ["Chrome (Linux)", "", ""],
                syncFullHistory: false,
                markOnlineOnConnect: false,
                shouldIgnoreJid: jid => jid === 'status@broadcast',
                connectTimeoutMs: 30000,
                keepAliveIntervalMs: 15000
            });

            Pair_Code_By_Elite_Tech.ev.on('creds.update', saveCreds);

            Pair_Code_By_Elite_Tech.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    // QR code generated event (if needed)
                }

                if (connection === "open") {
                    console.log("✅ Connection opened successfully (Chrome Linux)");

                    await delay(2000);

                    if (!Pair_Code_By_Elite_Tech.authState.creds.registered) {
                        num = num.replace(/[^0-9]/g, '');
                        const code = await Pair_Code_By_Elite_Tech.requestPairingCode(num);

                        if (!res.headersSent) {
                            res.send({ code });
                        }
                    } else {
                        let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                        let b64data = Buffer.from(data).toString('base64');
                        let session = await Pair_Code_By_Elite_Tech.sendMessage(
                            Pair_Code_By_Elite_Tech.user.id,
                            { text: b64data }
                        );

                        const ELITE_TECH_TEXT = `
*_Pair Code Connected by Elite-Tech_*
*_Made With ♥️👀_*
______________________________________
╔════◇
║ *『 AMAZING YOU'VE CHOSEN ELITE-TECH 』*
║ _You Have Completed the First Step to Deploy a Whatsapp Bot._
╚════════════════════════╝
╔═════◇
║  『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
║❒ *Owner:* https://wa.me/254743727510
║❒ *Repo:* _https://github.com/Elite-Tech/elite-tech/_
║❒ *WaChannel:* _https://whatsapp.com/channel/0029VahusSh0QeaoFzHJCk2x
║❒ *Plugins:* _https://github.com/Elite-Tech/elite-tech 
╚════════════════════════╝
_____________________________________

_Don't Forget To Give Star To My Repo_`;

                        await Pair_Code_By_Elite_Tech.sendMessage(
                            Pair_Code_By_Elite_Tech.user.id,
                            { text: ELITE_TECH_TEXT },
                            { quoted: session }
                        );

                        await delay(500);
                        await Pair_Code_By_Elite_Tech.ws.close();
                        await removeFile('./temp/' + id);
                    }
                } else if (connection === "close") {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                    console.log("❌ Connection closed", { lastDisconnect, shouldReconnect });

                    if (shouldReconnect) {
                        await delay(10000);
                        MASTERTECH_XD_PAIR_CODE().catch(err => {
                            console.error("Reconnection error:", err);
                            if (!res.headersSent) {
                                res.status(500).send({ error: "Reconnection failed" });
                            }
                        });
                    }
                }
            });

        } catch (err) {
            console.error("Error in pairing process:", err);

            if (Pair_Code_By_Elite_Tech) {
                await Pair_Code_By_Elite_Tech.ws?.close();
            }

            await removeFile('./temp/' + id);

            if (!res.headersSent) {
                res.status(500).send({
                    code: "Service Unavailable",
                    error: err.message
                });
            }
        }
    }

    // Timeout after 1 minute
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).send({ error: "Pairing process timed out" });
        }
    }, 60000);

    try {
        await MASTERTECH_XD_PAIR_CODE();
    } finally {
        clearTimeout(timeout);
    }
});

module.exports = router;
