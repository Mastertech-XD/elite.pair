const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('1DnoOkf5Grx4euI_JnQjpVxDoUE79bep'); // Remove or secure this API key
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");
const {
    default: Elite_Tech,
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

    async function ELITE_TECH_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
        
        try {
            const Elite_Tech_Instance = Elite_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Desktop")
            });

            if (!Elite_Tech_Instance.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Elite_Tech_Instance.requestPairingCode(num);
                
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Elite_Tech_Instance.ev.on('creds.update', saveCreds);
            Elite_Tech_Instance.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                
                if (connection === "open") {
                    await delay(5000);
                    const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    const b64data = Buffer.from(data).toString('base64');
                    const session = await Elite_Tech_Instance.sendMessage(Elite_Tech_Instance.user.id, { text: b64data });

                    const ELITE_TECH_TEXT = `
*_Pair Code Connected by Elite-Tech_*
*_Made With ❤️_*
______________________________________
╔════◇
║ *『 YOU\'VE CHOSEN ELITE-TECH 』*
║ _WhatsApp Bot Deployment Started_
╚════════════════════════╝
╔═════◇
║  『••• CONTACT & RESOURCES •••』
║❒ *Owner:* https://wa.me/254743727510
║❒ *Repo:* https://github.com/Elite-Tech/elite-tech
║❒ *Channel:* https://whatsapp.com/channel/0029VahusSh0QeaoFzHJCk2x
║❒ *Plugins:* https://github.com/Elite-Tech/elite-tech-plugins
╚════════════════════════╝
_____________________________________

_Don't Forget To Star Our Repositories_`;

                    await Elite_Tech_Instance.sendMessage(
                        Elite_Tech_Instance.user.id,
                        { text: ELITE_TECH_TEXT },
                        { quoted: session }
                    );

                    await delay(100);
                    await Elite_Tech_Instance.ws.close();
                    return removeFile(`./temp/${id}`);
                } else if (connection === "close" && lastDisconnect?.error?.output.statusCode !== 401) {
                    await delay(10000);
                    ELITE_TECH_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Service error:", err);
            await removeFile(`./temp/${id}`);
            if (!res.headersSent) {
                await res.status(503).send({ code: "Service Unavailable" });
            }
        }
    }

    return ELITE_TECH_PAIR_CODE();
});

module.exports = router;
