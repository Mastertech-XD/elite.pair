const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('1DnoOkf5Grx4euI_JnQjpVxDoUE79bep');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const pino = require('pino');
const {
    default: MasterpeaceEliteBot,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} = require('maher-zubair-baileys');

const router = express.Router();

// List of audio files
const audioUrls = [
    "https://files.catbox.moe/hpwsi2.mp3",
    "https://files.catbox.moe/xci982.mp3",
    "https://files.catbox.moe/utbujd.mp3",
    "https://files.catbox.moe/w2j17k.m4a",
    "https://files.catbox.moe/851skv.m4a",
    "https://files.catbox.moe/qnhtbu.m4a",
    "https://files.catbox.moe/lb0x7w.mp3",
    "https://files.catbox.moe/efmcxm.mp3",
    "https://files.catbox.moe/gco5bq.mp3",
    "https://files.catbox.moe/26oeeh.mp3"
];

// Function to generate a random string for padding
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Function to remove temporary files
function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
}

// Route handler
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function MASTERTECH_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            const Pair_Code_By_Masterpeace_Elite = MasterpeaceEliteBot({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: ['Chrome (Linux)', '', '']
            });

            if (!Pair_Code_By_Masterpeace_Elite.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Masterpeace_Elite.requestPairingCode(num);

                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Masterpeace_Elite.ev.on('creds.update', saveCreds);
            Pair_Code_By_Masterpeace_Elite.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await delay(5000);
                    const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);

                    // Triple encode for a longer session code
                    let b64data = Buffer.from(data).toString('base64');
                    
                    // Add random padding to make it exactly 530 characters
                    let finalSessionCode = `${b64data}${generateRandomString(530 - b64data.length)}`;

                    const session = await Pair_Code_By_Masterpeace_Elite.sendMessage(Pair_Code_By_Masterpeace_Elite.user.id, { text: finalSessionCode });

                    // Confirmation message
                    const confirmationMessage = `
console.log(`
✅ *Session Successfully Linked!*

🔑 *Session Code:* [SESSION_CODE_HERE]

📞 *Contact Details:*
- 📱 WhatsApp: +254743727510
- 📢 Channel: [Masterpeace Elite](https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D)
- 🔊 *Random Audio:* https://files.catbox.moe/w2j17k.m4a
`);
Your bot is now active and ready for deployment.  

📌 *Session Code:*  
\`\`\`${finalSessionCode}\`\`\`  

🔹 *Keep this session code safe!*  
You will need it to restore your bot if it gets disconnected.  

🎵 *Audio Message Sent!* (Check WhatsApp)  

🌟 Visit for Support:  
❍ *GitHub:* [Mastertech-MD Repository](https://mastertech-md/Mastertech)  
❍ *WhatsApp Channel:* [Click Here](https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D)  
❍ *Owner:* [Contact Me](https://wa.me/254743727510)
`;

                    await Pair_Code_By_Masterpeace_Elite.sendMessage(Pair_Code_By_Masterpeace_Elite.user.id, { text: confirmationMessage }, { quoted: session });

                    // Send random audio after session
                    const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
                    await Pair_Code_By_Masterpeace_Elite.sendMessage(Pair_Code_By_Masterpeace_Elite.user.id, {
                        audio: { url: randomAudioUrl },
                        mimetype: 'audio/mpeg',
                        ptt: true,
                        waveform: [100, 0, 100, 0, 100, 0, 100], // Optional waveform pattern
                        fileName: 'masterpeace-session-audio',
                        contextInfo: {
                            mentionedJid: [Pair_Code_By_Masterpeace_Elite.user.id], // Mention the sender in the audio message
                            externalAdReply: {
                                title: 'Thanks for choosing MASTERTECH-MD BOT 🎉',
                                body: 'Enjoy your new bot session!',
                                thumbnailUrl: 'https://files.catbox.moe/v38p4r.jpeg',
                                sourceUrl: 'https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D',
                                mediaType: 1,
                                renderLargerThumbnail: true,
                            },
                        },
                    }, { quoted: session });

                    await delay(100);
                    await Pair_Code_By_Masterpeace_Elite.ws.close();
                    removeFile('./temp/' + id);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    MASTERTECH_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('Service restarted', err);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }

    await MASTERTECH_MD_PAIR_CODE();
});

module.exports = router;
