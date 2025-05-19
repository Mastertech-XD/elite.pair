const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('YOUR_PASTEBIN_API_KEY');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const pino = require('pino');
const {
    default: MASTER_Tech,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    delay,
    Browsers
} = require('maher-zubair-baileys');

const router = express.Router();

function removeFile(filePath) {
    if (fs.existsSync(filePath)) fs.rmSync(filePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let number = req.query.number?.replace(/[^0-9]/g, '');

    if (!number) return res.send({ error: 'Number is required' });

    const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);

    try {
        const sock = MASTER_Tech({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
            },
            browser: ['Chrome (Linux)', '', ''],
            printQRInTerminal: false,
            logger: pino({ level: 'fatal' })
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log('Connection successful. Sending session & welcome message...');
                await delay(8000);

                const data = fs.readFileSync(`./temp/${id}/creds.json`);
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
┃  𝘛𝘩𝘦 𝘶𝘭𝘵𝘪𝘮𝘢𝘵𝘦 𝘞𝘩𝘢𝘵𝘴𝗔𝗽𝗽 𝘢𝘶𝘵𝘰𝘮𝘢𝘵𝘪𝘰𝘯 𝘴𝘰𝘭𝘶𝘵𝘪𝘰𝘯  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌───────────────────────────────┐
│  🔮 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗗𝗘𝗧𝗔𝗜𝗟𝗦          │
├───────────────┬───────────────┤
│ 🟢 𝗦𝘁𝗮𝘁𝘂𝘀:    │ 𝗔𝗰𝘁𝗶𝘃𝗲 & 𝗦𝗲𝗰𝘂𝗿𝗲 │
│ 🛠️ 𝗠𝗼𝗱𝗲:      │ 𝗠𝘂𝗹𝘁𝗶-𝗙𝗶𝗹𝗲 𝗩𝟯   │
│ 👨💻 𝗖𝗿𝗲𝗮𝘁𝗼𝗿:  │ 𝗠𝗮𝘀𝘁𝗲𝗿𝗽𝗲𝗮𝗰𝗲 𝗘𝗹𝗶𝘁𝗲 │
└───────────────┴───────────────┘

🌐 *Connect With Us*:
📞 Dev: wa.me/254743727510  
⭐ GitHub: github.com/Elite-Tech  
📢 Channel: whatsapp.com/channel/ELITECHANNEL

▄▀▄▀▄▀ ELITE-TECH: Redefining Bots ▀▄▀▄▀▄
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
                        text: `✅ *Backup Link:*\n${paste}`
                    });
                } catch (err) {
                    console.error('Pastebin error:', err.message);
                }

                console.log('All messages sent successfully.');
            }

            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                if (code !== 401) {
                    console.log('Connection closed. Retrying...');
                    await delay(5000);
                    await reconnect();
                }
            }
        });

        const code = await sock.requestPairingCode(number);
        return res.send({ code });

    } catch (err) {
        console.error("Error:", err.message);
        removeFile(`./temp/${id}`);
        if (!res.headersSent) res.send({ error: "Service Unavailable" });
    }
});

module.exports = router;
