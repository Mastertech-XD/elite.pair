const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('1DnoOkf5Grx4euI_JnQjpVxDoUE79bep');

const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
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

    async function MASTERTECH_XD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            const sock = MASTER_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
                },
                browser: Browsers.macOS('Desktop'),
                logger: pino({ level: "fatal" }),
                printQRInTerminal: false
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    console.log('Paired successfully');

                    await delay(10000);

                    const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    const b64data = Buffer.from(data).toString('base64');

                    const sessionMsg = await sock.sendMessage(sock.user.id, {
                        text: b64data
                    });

                    const ELITE_TECH_TEXT = `
  ░█▀▀░█▀█░█▀▄░█▀▀░█▀▀░░░█▀▀░▀█▀░█▀█░█▀▀
  ░█▀▀░█░█░█▀▄░█▀▀░█▀▀░░░▀▀█░░█░░█░█░█▀▀
  ░▀▀▀░▀░▀░▀░▀░▀▀▀░▀▀▀░░░▀▀▀░░▀░░▀░▀░▀▀▀

╔════════════════❖════════════════╗
       ꧁༺ ✨ 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟! ✨ ༻꧂       
╚════════════════❖════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🚀 𝗘𝗟𝗜𝗧𝗘-𝗧𝗘𝗖𝗛 𝗙𝗥𝗔𝗠𝗘𝗪𝗢𝗥𝗞 𝟯.𝟬   ┃
┃  𝘛𝘩𝘦 𝘂𝘭𝘁𝘪𝗺𝗮𝘁𝗲 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗼𝗻 𝘀𝗼𝗹𝘂𝘁𝗶𝗼𝗻  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌───────────────────────────────┐
│  🔮 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗗𝗘𝗧𝗔𝗜𝗟𝗦          │
├───────────────┬───────────────┤
│ 🟢 𝗦𝘁𝗮𝘁𝘂𝘀:    │ 𝗔𝗰𝘁𝗶𝘃𝗲 & 𝗦𝗲𝗰𝘂𝗿𝗲 │
│ 🛠️ 𝗠𝗼𝗱𝗲:      │ 𝗠𝘂𝗹𝘁𝗶-𝗙𝗶𝗹𝗲 𝗩𝟯   │
│ 👨💻 𝗖𝗿𝗲𝗮𝘁𝗼𝗿:  │ 𝗠𝗮𝘀𝘁𝗲𝗿𝗽𝗲𝗮𝗰𝗲 𝗘𝗹𝗶𝘁𝗲 │
└───────────────┴───────────────┘

┌───────────────────────────────┐
│  📜 𝗡𝗘𝗫𝗧 𝗦𝗧𝗘𝗣𝗦              │
├───────────────────────────────┤
│ ✅ 𝗣𝗮𝗶𝗿𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲         │
│ 🚀 𝗥𝘂𝗻 /𝘀𝗲𝘁𝘂𝗽 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗲  │
│ 💡 𝗧𝗶𝗽: 𝗨𝘀𝗲 /𝗵𝗲𝗹𝗽 𝗳𝗼𝗿 𝗴𝘂𝗶𝗱𝗲 │
└───────────────────────────────┘

┌───────────────────────────────┐
│  🌐 𝗖𝗢𝗡𝗡𝗘𝗖𝗧 𝗪𝗜𝗧𝗛 𝗨𝗦         │
├───────────────────────────────┤
│ 🔗 𝗗𝗲𝘃: wa.me/254743727510   │
│ 🐙 github.com/Elite-Tech     │
│ 📢 wa.me/channel-link-here   │
│ 💌 buymeacoffee.com/elite    │
└───────────────────────────────┘

╔════════════════❖════════════════╗
    💎 𝗟𝗢𝗩𝗘 𝗧𝗛𝗜𝗦? 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 𝗨𝗦!  
    ⭐ 𝗚𝗶𝘃𝗲 𝗮 𝗦𝘁𝗮𝗿 │ 📣 𝗦𝗵𝗮𝗿𝗲  
╚════════════════❖════════════════╝

▄▀▄▀▄▀▄▀▄▀▄ 𝗘𝗟𝗜𝗧𝗘-𝗧𝗘𝗖𝗛: 𝗥𝗲𝗱𝗲𝗳𝗶𝗻𝗶𝗻𝗴 𝗕𝗼𝘁𝘀 ▀▄▀▄▀▄▀▄▀▄
`;

                    await sock.sendMessage(sock.user.id, {
                        text: ELITE_TECH_TEXT
                    }, { quoted: sessionMsg });

                    try {
                        const paste = await pastebin.createPaste({
                            title: `Elite-Tech Session - ${id}`,
                            content: b64data,
                            format: "text",
                            privacy: 1,
                            expireDate: "1D"
                        });

                        await sock.sendMessage(sock.user.id, {
                            text: `✅ *Your Session Backup (Pastebin):*\n${paste}`
                        });

                        console.log('Pastebin session uploaded:', paste);
                    } catch (e) {
                        console.log('Pastebin failed:', e.message);
                    }
                }

                else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log('Retrying connection in 10s...');
                    await delay(10000);
                    await MASTERTECH_XD_PAIR_CODE();
                }
            });

            // Initiate pairing if not registered
            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);

                if (!res.headersSent) {
                    res.send({ code });
                }
            }

        } catch (err) {
            console.log("Error occurred:", err.message);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.send({ code: "Service Unavailable" });
            }
        }
    }

    await MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
