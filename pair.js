const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: Gifted_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("maher-zubair-baileys");

// Improved file removal function
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    try {
        fs.rmSync(FilePath, { recursive: true, force: true });
        return true;
    } catch (err) {
        console.error(`Error removing file ${FilePath}:`, err);
        return false;
    }
}

// Validate and format phone number
function formatPhoneNumber(num) {
    if (!num) throw new Error('Phone number is required');
    
    // Remove all non-digit characters
    num = num.replace(/[^0-9]/g, '');
    
    // Ensure proper length
    if (num.length < 8) throw new Error('Phone number too short');
    
    // Add country code if missing (default to +1 if no country code provided)
    if (!num.startsWith('+')) {
        // You might want to modify this based on your target users' country codes
        num = `+${num}`; // Or use a specific default country code like `+1${num}`
    }
    
    return num;
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    if (!num) {
        return res.status(400).send({ error: 'Phone number is required' });
    }

    try {
        num = formatPhoneNumber(num);
    } catch (err) {
        return res.status(400).send({ error: err.message });
    }

    async function GIFTED_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
        
        try {
            let Pair_Code_By_Gifted_Tech = Gifted_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Chrome (Linux)", "", ""],
                syncFullHistory: false,
                markOnlineOnConnect: false,
                shouldIgnoreJid: jid => jid === 'status@broadcast',
                fireInitQueries: false
            });

            if (!Pair_Code_By_Gifted_Tech.authState.creds.registered) {
                await delay(1000);
                
                let code;
                try {
                    // Request pairing code with retry logic
                    const maxRetries = 3;
                    let attempts = 0;
                    let lastError;
                    
                    while (attempts < maxRetries) {
                        attempts++;
                        try {
                            code = await Pair_Code_By_Gifted_Tech.requestPairingCode(num);
                            break;
                        } catch (error) {
                            lastError = error;
                            console.error(`Attempt ${attempts} failed:`, error);
                            if (attempts < maxRetries) {
                                await delay(2000);
                            }
                        }
                    }
                    
                    if (!code && lastError) {
                        throw lastError;
                    }
                    
                } catch (err) {
                    console.error('Failed to get pairing code:', err);
                    await Pair_Code_By_Gifted_Tech.ws.close();
                    removeFile(`./temp/${id}`);
                    return res.status(500).send({ 
                        error: 'Failed to generate pairing code',
                        details: err.message 
                    });
                }

                if (!res.headersSent) {
                    res.send({ 
                        code,
                        number: num,
                        expires_in: '120 seconds',
                        timestamp: new Date().toISOString()
                    });
                }

                // Set timeout for code expiration (2 minutes)
                const expirationTimer = setTimeout(async () => {
                    if (!Pair_Code_By_Gifted_Tech.authState.creds.registered) {
                        console.log('Pairing code expired');
                        await Pair_Code_By_Gifted_Tech.ws.close();
                        removeFile(`./temp/${id}`);
                    }
                }, 120000);

                Pair_Code_By_Gifted_Tech.ev.on('creds.update', saveCreds);
                Pair_Code_By_Gifted_Tech.ev.on("connection.update", async (s) => {
                    const { connection, lastDisconnect } = s;
                    
                    if (connection === "open") {
                        clearTimeout(expirationTimer);
                        await delay(3000);
                        
                        try {
                            let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                            await delay(500);
                            let b64data = Buffer.from(data).toString('base64');
                            
                            let session = await Pair_Code_By_Gifted_Tech.sendMessage(
                                Pair_Code_By_Gifted_Tech.user.id, 
                                { text: b64data }
                            );

                            let GIFTED_MD_TEXT = `
░█▀▀░█▀█░█▀▄░█▀▀░█▀▀░░░█▀▀░▀█▀░█▀█░█▀▀
░█▀▀░█░█░█▀▄░█▀▀░█▀▀░░░▀▀█░░█░░█░█░█▀▀
░▀▀▀░▀░▀░▀░▀░▀▀▀░▀▀▀░░░▀▀▀░░▀░░▀░▀░▀▀▀

╔════════════════❖════════════════╗
꧁༺ ✨ 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟! ✨ ༻꧂
╚════════════════❖════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🚀 𝗘𝗟𝗜𝗧𝗘-𝗧𝗘𝗖𝗛 𝗙𝗥𝗔𝗠𝗘𝗪𝗢𝗥𝗞 𝟯.𝟬   ┃
┃  𝘛𝘩𝘦 𝘶𝘭𝘵𝘪𝘮𝘢𝘵𝘦 𝘞𝘩𝘢𝘵𝘴𝗔𝗽𝗽 𝘢𝘶𝘵𝘰𝗺𝗮𝘵𝗶𝘰𝗯 𝘴𝘰𝘭𝘶𝘵𝗶𝘰𝗻  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌───────────────────────────────┐
│  🔮 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗗𝗘𝗧𝗔𝗜𝗟𝗦          │
├───────────────┬───────────────┤
│ 🟢 𝗦𝘁𝗮𝘁𝘂𝘀:    │ 𝗔𝗰𝘁𝗶𝘃𝗲 & 𝗦𝗲𝗰𝘂𝗿𝗲 │
│ 🛠️ 𝗠𝗼𝗱𝗲:      │ 𝗠𝘂𝗹𝘁𝗶-𝗙𝗶𝗹𝗲 𝗩𝟯   │
│ 👨💻 𝗖𝗿𝗲𝗮𝘁𝗼𝗿:  │ 𝗠𝗮𝘀𝘁𝗲𝗿𝗽𝗲𝗮𝗰𝗲 𝗘𝗹𝗶𝘁𝗲 │
└───────────────┴───────────────┘
                            `;
                            
                            await Pair_Code_By_Gifted_Tech.sendMessage(
                                Pair_Code_By_Gifted_Tech.user.id,
                                { text: GIFTED_MD_TEXT },
                                { quoted: session }
                            );

                            await delay(100);
                            await Pair_Code_By_Gifted_Tech.ws.close();
                            removeFile(`./temp/${id}`);
                            
                        } catch (err) {
                            console.error('Error in successful connection:', err);
                            await Pair_Code_By_Gifted_Tech.ws.close();
                            removeFile(`./temp/${id}`);
                        }
                    } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                        console.log('Connection closed, attempting reconnect...');
                        await delay(10000);
                        removeFile(`./temp/${id}`);
                        GIFTED_MD_PAIR_CODE().catch(err => {
                            console.error('Reconnect failed:', err);
                        });
                    }
                });
            }
        } catch (err) {
            console.error("Error in pairing process:", err);
            removeFile(`./temp/${id}`);
            
            if (!res.headersSent) {
                res.status(500).send({ 
                    error: "Service Unavailable",
                    details: err.message 
                });
            }
        }
    }
    
    try {
        await GIFTED_MD_PAIR_CODE();
    } catch (err) {
        console.error("Outer error handler:", err);
        if (!res.headersSent) {
            res.status(500).send({ 
                error: "Internal Server Error",
                details: err.message 
            });
        }
    }
});

module.exports = router;
