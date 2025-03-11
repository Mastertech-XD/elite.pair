const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pino = require("pino");
const { makeid } = require('./id');
const {
    default: MasterpeaceEliteBot,
    useMultiFileAuthState,
    jidNormalizedUser,
    Browsers,
    delay,
} = require("@whiskeysockets/baileys");

const router = express.Router();

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();

    async function GENERATE_QR_SESSION() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            let botInstance = MasterpeaceEliteBot({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });

            botInstance.ev.on('creds.update', saveCreds);
            botInstance.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    const qrImage = await QRCode.toBuffer(qr);
res.setHeader('Content-Type', 'image/png');
res.send(qrImage);
                }

                if (connection == "open") {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');

                    let session = await botInstance.sendMessage(botInstance.user.id, { text: 'MASTERPEACE-SESSION;;;' + b64data });

                    let sessionMessage = `
*Session Connected ✅*
Enjoy 😺
By _Masterpeace Elite_
______________________________

╭──『 *MASTERTECH-MD BOT* 』
│ You've successfully linked your session.
│ Ready to deploy your bot.
╰───────────────────────

🌟 Visit for Support:
❍ *GitHub:* [Mastertech-MD Repository](https://mastertech-md/Mastertech)
❍ *WhatsApp Channel:* [Click Here](https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D)
❍ *Owner:* [Contact Me](https://wa.me/254743727510)

📢 Don't forget to give a ⭐ to my repo!
`;

                    await botInstance.sendMessage(botInstance.user.id, { text: sessionMessage }, { quoted: session });

                    await delay(100);
                    await botInstance.ws.close();
                    removeFile("temp/" + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    GENERATE_QR_SESSION();
                }
            });

        } catch (err) {
            if (!res.headersSent) {
                await res.json({ code: "Service Unavailable" });
            }
            console.log(err);
            removeFile("temp/" + id);
        }
    }

    return await GENERATE_QR_SESSION();
});

module.exports = router;
