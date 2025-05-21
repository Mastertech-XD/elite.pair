const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
    default: Gifted_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("maher-zubair-baileys");

function removeFile(FilePath){
    if(!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true })
 };
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
        async function GIFTED_MD_PAIR_CODE() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/'+id)
     try {
            let Pair_Code_By_Gifted_Tech = Gifted_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}).child({level: "fatal"})),
                },
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: ["Chrome (Linux)", "", ""]
             });
             if(!Pair_Code_By_Gifted_Tech.authState.creds.registered) {
                await delay(1500);
                        num = num.replace(/[^0-9]/g,'');
                            const code = await Pair_Code_By_Gifted_Tech.requestPairingCode(num)
                 if(!res.headersSent){
                 await res.send({code});
                     }
                 }
            Pair_Code_By_Gifted_Tech.ev.on('creds.update', saveCreds)
            Pair_Code_By_Gifted_Tech.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect
                } = s;
                if (connection == "open") {
                await delay(5000);
                let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                await delay(800);
               let b64data = Buffer.from(data).toString('base64');
               let session = await Pair_Code_By_Gifted_Tech.sendMessage(Pair_Code_By_Gifted_Tech.user.id, { text: '' + b64data });

               let GIFTED_MD_TEXT = `
               
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
│ 🚀 𝗥𝘂𝗻 setup 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗴𝘂𝗿𝗲     │
│ 💡 𝗨𝘀𝗲 help 𝗳𝗼𝗿 𝗴𝘂𝗶𝗱𝗲𝘀       │
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
 await Pair_Code_By_Gifted_Tech.sendMessage(Pair_Code_By_Gifted_Tech.user.id,{text:GIFTED_MD_TEXT},{quoted:session})
 

        await delay(100);
        await Pair_Code_By_Gifted_Tech.ws.close();
        return await removeFile('./temp/'+id);
            } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    GIFTED_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("service restated");
            await removeFile('./temp/'+id);
         if(!res.headersSent){
            await res.send({code:"Service Unavailable"});
         }
        }
    }
    return await GIFTED_MD_PAIR_CODE()
});
module.exports = router
