const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { default: WhatsAppBot } = require('@whiskeysockets/baileys');

// Your original audio links preserved exactly
const AUDIO_LIBRARY = [
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
].map(url => ({
    url,
    hash: crypto.createHash('sha256').update(url).digest('hex') // Security measure
}));

async function getRandomAudio() {
    const randomIndex = crypto.randomInt(0, AUDIO_LIBRARY.length);
    return AUDIO_LIBRARY[randomIndex];
}

// Enhanced session handler with your audio links
async function handlePairingSession(number) {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const sessionDir = `./sessions/${sessionId}`;
    
    try {
        await fs.mkdir(sessionDir, { recursive: true });
        
        // WhatsApp connection setup
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const bot = WhatsAppBot({ /* your config */ });
        
        if (!bot.authState.creds.registered) {
            const pairingCode = await bot.requestPairingCode(number);
            
            bot.ev.on('connection.update', async (update) => {
                if (update.connection === 'open') {
                    // Your original session confirmation flow
                    const audio = await getRandomAudio();
                    
                    await bot.sendMessage(bot.user.id, { 
                        text: "Your MASTERTECH-MD session is ready!" 
                    });
                    
                    // Send one of your audio files
                    await bot.sendMessage(bot.user.id, {
                        audio: { url: audio.url },
                        mimetype: audio.url.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg'
                    });
                }
            });
            
            return { code: pairingCode };
        }
    } finally {
        await cleanupSession(sessionDir); 
    }
}

// Preserved your original audio sending logic
async function sendSessionConfirmation(bot) {
    const audio = await getRandomAudio();
    
    await bot.sendMessage(bot.user.id, {
        audio: { url: audio.url },
        mimetype: audio.url.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg',
        ptt: true,
        contextInfo: {
            externalAdReply: {
                title: 'MASTERTECH-MD',
                body: 'Session established!',
                thumbnailUrl: 'https://files.catbox.moe/v38p4r.jpeg',
                sourceUrl: 'https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D'
            }
        }
    });
}
