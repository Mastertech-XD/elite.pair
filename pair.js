const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('1DnoOkf5Grx4euI_JnQjpVxDoUE79bep');

const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const pino = require('pino');
const router = express.Router();

const {
    default: MASTER_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require('maher-zubair-baileys');

function removeFile(FilePath) {
    if (fs.existsSync(FilePath)) fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    if (!num) return res.send({ error: "No number provided" });

    async function MASTERTECH_XD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            const Pair_Code_By_Elite_Tech = await MASTER_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
                },
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.baileys("Linux")
            });

            Pair_Code_By_Elite_Tech.ev.on("creds.update", saveCreds);

            Pair_Code_By_Elite_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(10000);

                    const data = fs.readFileSync(`./temp/${id}/creds.json`);
                    const b64data = Buffer.from(data).toString("base64");

                    const session = await Pair_Code_By_Elite_Tech.sendMessage(
                        Pair_Code_By_Elite_Tech.user.id,
                        { text: `${b64data}` }
                    );

                    const ELITE_TECH_TEXT = `
  ░█▀▀░█▀█░█▀▄░█▀▀░█▀▀░░░█▀▀░▀█▀░█▀█░█▀▀
  ░█▀▀░█░█░█▀▄░█▀▀░█▀▀░░░▀▀█░░█░░█░█░█▀▀
  ░▀▀▀░▀░▀░▀░▀░▀▀▀░▀▀▀░░░▀▀▀░░▀░░▀░▀░▀▀▀

╔════════════════❖════════════════╗
       ꧁༺ ✨ 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟! ✨ ༻꧂       
╚════════════════❖════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🚀 𝗘𝗟𝗜𝗧𝗘-𝗧𝗘𝗖𝗛 𝗙𝗥𝗔𝗠𝗘𝗪𝗢𝗥𝗞 𝟯.𝟬   ┃
┃  𝘛𝘩𝘦 𝘶𝘭𝘵𝘪𝘮𝘢𝘵𝘦 𝘞𝘩𝘢𝘵𝘴𝗔𝗽𝗽 𝘢𝘶𝘵𝗼𝘮𝗮𝘵𝗶𝘰𝘯 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🔮 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗗𝗘𝗧𝗔𝗜𝗟𝗦
│ 🟢 Status: Active & Secure
│ 🛠️ Mode: Multi-File V3
│ 👨‍💻 Creator: Masterpeace Elite

📜 𝗡𝗘𝗫𝗧 𝗦𝗧𝗘𝗣𝗦
✅ Pairing Complete
🚀 Run /setup to configure
💡 Tip: Use /help for guidance

🌐 CONNECT WITH US
🔗 Dev: wa.me/254743727510
🐙 GitHub: github.com/Elite-Tech
📢 Channel: t.me/eliteupdates
💌 Donate: buymeacoffee.com/elite

▄▀▄▀▄▀▄▀▄▀▄ 𝗘𝗟𝗜𝗧𝗘-𝗧𝗘𝗖𝗛: 𝗥𝗲𝗱𝗲𝗳𝗶𝗻𝗶𝗻𝗴 𝗕𝗼𝘁𝘀 ▀▄▀▄▀▄▀▄▀▄
                    `;

                    await Pair_Code_By_Elite_Tech.sendMessage(Pair_Code_By_Elite_Tech.user.id, {
                        text: ELITE_TECH_TEXT
                    }, { quoted: session });

                    // Upload to Pastebin
                    try {
                        const paste = await pastebin.createPaste({
                            title: `Elite-Tech Session - ${id}`,
                            content: b64data,
                            format: "text",
                            privacy: 1,
                            expireDate: "1D"
                        });

                        await Pair_Code_By_Elite_Tech.sendMessage(Pair_Code_By_Elite_Tech.user.id, {
                            text: `✅ Your Session Backup (Pastebin):\n${paste}`
                        });
                    } catch (err) {
                        console.log("Pastebin upload failed:", err.message);
                    }

                    console.log("Successfully paired and sent session.");
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log("Connection closed. Retrying...");
                    await delay(5000);
                    await MASTERTECH_XD_PAIR_CODE();
                }
            });

            if (!Pair_Code_By_Elite_Tech.authState.creds.registered) {
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Elite_Tech.requestPairingCode(num);
                if (!res.headersSent) return res.send({ code });
            }

        } catch (err) {
            console.error("Error:", err.message);
            removeFile('./temp/' + id);
            if (!res.headersSent) res.send({ code: "Service Unavailable" });
        }
    }

    await MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
