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
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
};

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;

  async function MASTERTECH_XD_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
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

      // Setup listeners before pairing
      Pair_Code_By_Elite_Tech.ev.on('creds.update', saveCreds);

      Pair_Code_By_Elite_Tech.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection === "open") {
          console.log('Connected to WhatsApp. Waiting for full sync...');
          await delay(10000); // Wait 10 seconds for sync

          let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
          await delay(800);
          let b64data = Buffer.from(data).toString('base64');

          // Send session base64
          let session = await Pair_Code_By_Elite_Tech.sendMessage(Pair_Code_By_Elite_Tech.user.id, { text: '' + b64data });

          // Ultra-premium pairing success message
          const ELITE_TECH_TEXT = `
  ░█▀▀░█▀█░█▀▄░█▀▀░█▀▀░░░█▀▀░▀█▀░█▀█░█▀▀  
  ░█▀▀░█░█░█▀▄░█▀▀░█▀▀░░░▀▀█░░█░░█░█░█▀▀  
  ░▀▀▀░▀░▀░▀░▀░▀▀▀░▀▀▀░░░▀▀▀░░▀░░▀░▀░▀▀▀  

╔════════════════❖════════════════╗
       ꧁༺ ✨ 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟! ✨ ༻꧂       
╚════════════════❖════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🚀 𝗘𝗟𝗜𝗧𝗘-𝗧𝗘𝗖𝗛 𝗙𝗥𝗔𝗠𝗘𝗪𝗢𝗥𝗞 𝟯.𝟬   ┃
┃  𝘛𝘩𝘦 𝘶𝘭𝘵𝘪𝘮𝘢𝘵𝘦 𝘞𝘩𝘢𝘵𝘴𝗔𝗽𝗽 𝘢𝘶𝘵𝘰𝗺𝗮𝘁𝗶𝗼𝗻 𝘴𝘰𝘭𝘶𝘁𝗶𝗼𝗻  ┃
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
│ 🚀 𝗥𝘂𝗻 *setup* 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗲     │
│ 💡 𝗨𝘀𝗲 *help* 𝗳𝗼𝗿 𝗴𝘂𝗶𝗱𝗲𝘀       │
└───────────────────────────────┘

┌───────────────────────────────┐
│  🌐 𝗖𝗢𝗡𝗡𝗘𝗖𝗧 𝗪𝗜𝗧𝗛 𝗨𝗦         │
├───────────────────────────────┤
│ 🔗 Dev: https://wa.me/254743727510       │
│ 🐙 GitHub: https://github.com/Elite-Tech/elite-tech │
│ 📢 Channel: https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D │
│ 💌 Donate: https://buymeacoffee.com/elite │
└───────────────────────────────┘

╔════════════════❖════════════════╗
    💎 𝗟𝗢𝗩𝗘 𝗧𝗛𝗜𝗦? 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 𝗨𝗦!  
    ⭐ 𝗚𝗶𝘃𝗲 𝗮 𝗦𝘁𝗮𝗿 │ 📣 𝗦𝗵𝗮𝗿𝗲  
╚════════════════❖════════════════╝

▄▀▄▀▄▀▄▀▄▀▄ 𝗘𝗟𝗜𝗧𝗘-𝗧𝗘𝗖𝗛: 𝗥𝗲𝗱𝗲𝗳𝗶𝗻𝗶𝗻𝗴 𝗕𝗼𝘁𝘀 ▀▄▀▄▀▄▀▄▀▄
          `;

          await Pair_Code_By_Elite_Tech.sendMessage(Pair_Code_By_Elite_Tech.user.id, { text: ELITE_TECH_TEXT }, { quoted: session });

          // OPTIONAL: Upload to Pastebin
          try {
            const paste = await pastebin.createPaste({
              title: `Elite-Tech Session - ${id}`,
              content: b64data,
              format: "text",
              privacy: 1, // unlisted
              expireDate: "1D"
            });

            console.log('Session uploaded to Pastebin:', paste);

            await Pair_Code_By_Elite_Tech.sendMessage(Pair_Code_By_Elite_Tech.user.id, {
              text: `✅ Your Session Backup (Pastebin Link):\n${paste}`
            });
          } catch (err) {
            console.log('Failed to upload session to Pastebin:', err.message);
          }

          console.log('Bot is fully connected and now staying active.');
        } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
          console.log('Connection closed, retrying in 10 seconds...');
          await delay(10000);
          await MASTERTECH_XD_PAIR_CODE();
        }
      });

      if (!Pair_Code_By_Elite_Tech.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await Pair_Code_By_Elite_Tech.requestPairingCode(num);

        if (!res.headersSent) {
          await res.send({ code });
        }
      }

    } catch (err) {
      console.log("Service restarted due to error:", err.message);
      await removeFile('./temp/' + id);
      if (!res.headersSent) {
        await res.send({ code: "Service Unavailable" });
      }
    }
  }

  return await MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
