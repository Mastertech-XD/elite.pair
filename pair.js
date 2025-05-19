const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('1DnoOkf5Grx4euI_JnQjpVxDoUE79bep');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");

const {
    default: MASTER_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("maher-zubair-baileys");

function removeFile(FilePath) {
    if (fs.existsSync(FilePath)) {
        fs.rmSync(FilePath, { recursive: true, force: true });
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    if (!num) {
        return res.status(400).send({ error: "Phone number (number) is required in the query." });
    }

    num = num.replace(/[^0-9]/g, '');

    async function MASTERTECH_XD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
        try {
            let Pair_Code_By_Elite_Tech = MASTER_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Chrome (Linux)", "", ""]
            });

            Pair_Code_By_Elite_Tech.ev.on('creds.update', saveCreds);

            Pair_Code_By_Elite_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                console.log("Connection Status:", connection);

                if (connection === "open") {
                    console.log('Connected to WhatsApp. Waiting for full sync...');
                    await delay(10000);

                    const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    const b64data = Buffer.from(data).toString('base64');

                    const session = await Pair_Code_By_Elite_Tech.sendMessage(Pair_Code_By_Elite_Tech.user.id, { text: '' + b64data });

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
║❒ *Owner:* https://wa.me/254743727510_
║❒ *Repo:* _https://github.com/Elite-Tech/elite-tech/_
║❒ *WaChannel:* _https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D
║❒ *Plugins:* _https://github.com/Elite-Tech/elite-tech 
╚════════════════════════╝
_____________________________________

_Don't Forget To Give Star To My Repo_`;

                    await Pair_Code_By_Elite_Tech.sendMessage(Pair_Code_By_Elite_Tech.user.id, { text: ELITE_TECH_TEXT }, { quoted: session });

                    try {
                        const paste = await pastebin.createPaste({
                            title: `Elite-Tech Session - ${id}`,
                            content: b64data,
                            format: "text",
                            privacy: 1,
                            expireDate: "1D"
                        });

                        console.log('Session uploaded to Pastebin:', paste);

                        await Pair_Code_By_Elite_Tech.sendMessage(Pair_Code_By_Elite_Tech.user.id, {
                            text: `✅ Your Session Backup (Pastebin Link):\n${paste}`
                        });
                    } catch (err) {
                        console.log('Pastebin upload failed:', err.message);
                    }
                }

                else if (connection === "close") {
                    const code = lastDisconnect?.error?.output?.statusCode;
                    console.log(`Connection closed: status ${code}`);
                    if (code !== 401) {
                        console.log('Reconnecting...');
                        await delay(10000);
                        await MASTERTECH_XD_PAIR_CODE();
                    }
                }
            });

            if (!Pair_Code_By_Elite_Tech.authState.creds.registered) {
                await delay(1500);
                try {
                    const code = await Pair_Code_By_Elite_Tech.requestPairingCode(num);
                    if (!res.headersSent) {
                        return res.send({ code });
                    }
                } catch (err) {
                    console.log("Error getting pairing code:", err.message);
                    await removeFile(`./temp/${id}`);
                    if (!res.headersSent) {
                        return res.status(500).send({ error: "Failed to request pairing code. Check number validity." });
                    }
                }
            }

        } catch (err) {
            console.error("Unexpected error:", err.message);
            await removeFile(`./temp/${id}`);
            if (!res.headersSent) {
                return res.status(500).send({ error: "Internal server error during session setup." });
            }
        }
    }

    await MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
