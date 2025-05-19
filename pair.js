const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('YOUR_API_KEY'); // Replace with a valid key
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
} = require("maher-zubair-baileys");

// Remove session files
function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;

  // Validate phone number
  if (!num || !/^\d+$/.test(num)) {
    return res.status(400).send({ error: "❌ Invalid phone number! Use international format (e.g., 254743727510)" });
  }

  async function MASTERTECH_XD_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
    try {
      const Pair_Code_By_Elite_Tech = MASTER_Tech({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: true, // ENABLE QR CODE IN TERMINAL FOR DEBUGGING
        logger: pino({ level: "silent" }), // Disable logs to avoid clutter
        browser: ["Ubuntu", "Chrome", "20.0.04"], // Use a different browser agent
      });

      // Save credentials on update
      Pair_Code_By_Elite_Tech.ev.on('creds.update', saveCreds);

      // Handle connection events
      Pair_Code_By_Elite_Tech.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;

        // On successful connection
        if (connection === "open") {
          console.log("✅ Connected to WhatsApp!");
          await delay(3000); // Wait for full sync

          // Read and send session data
          try {
            const data = fs.readFileSync(`./temp/${id}/creds.json`);
            const b64data = Buffer.from(data).toString('base64');

            // Send session to user
            await Pair_Code_By_Elite_Tech.sendMessage(
              Pair_Code_By_Elite_Tech.user.id,
              { text: `🔐 *YOUR SESSION DATA* (Base64):\n\n${b64data}` }
            );

            // RESTORED: Send the "Pairing Successful" message (Elite-Tech styled)
            const ELITE_TECH_TEXT = `
╔════════════════❖════════════════╗
       ꧁༺ ✨ 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟! ✨ ༻꧂       
╚════════════════❖════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🚀 𝗘𝗟𝗜𝗧𝗘-𝗧𝗘𝗖𝗛 𝗙𝗥𝗔𝗠𝗘𝗪𝗢𝗥𝗞 𝟯.𝟬   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

✅ *WhatsApp Linked Successfully!*
📌 *Next Steps:*
1. Run /menu to see commands
2. Use /help for guides

🔗 *Support:* https://wa.me/254743727510
            `;

            await Pair_Code_By_Elite_Tech.sendMessage(
              Pair_Code_By_Elite_Tech.user.id,
              { text: ELITE_TECH_TEXT }
            );

          } catch (err) {
            console.error("❌ Failed to send session:", err);
          }
        }

        // Auto-reconnect on close
        else if (connection === "close") {
          console.log("⚠️ Connection lost. Retrying in 5s...");
          await delay(5000);
          MASTERTECH_XD_PAIR_CODE(); // Reconnect
        }
      });

      // Request pairing code if not registered
      if (!Pair_Code_By_Elite_Tech.authState.creds.registered) {
        num = num.replace(/[^0-9]/g, '');
        const code = await Pair_Code_By_Elite_Tech.requestPairingCode(num);
        
        if (!res.headersSent) {
          res.send({ 
            code,
            message: `📲 *Enter this code in WhatsApp to link:* ${code}`
          });
        }
      }
    } catch (err) {
      console.error("❌ CRASHED:", err);
      removeFile(`./temp/${id}`);
      if (!res.headersSent) {
        res.status(500).send({ error: "Failed to connect. Try again later." });
      }
    }
  }

  await MASTERTECH_XD_PAIR_CODE();
});

module.exports = router;
