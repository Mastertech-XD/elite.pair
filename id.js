import crypto from 'crypto';

const WA_DEFAULT_EPOCH = process.env.WA_EPOCH || 1672531200;

class WABotSession {
    constructor() {
        if (!WA_DEFAULT_EPOCH || isNaN(WA_DEFAULT_EPOCH)) {
            throw new Error('Invalid WA_EPOCH value');
        }
        this.charPool = this.#initCharPool();
    }

    #initCharPool() {
        const alphanum = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const specials = '-_~.!$*';
        return alphanum + specials;
    }

    generate(length = 64) {
        if (typeof length !== 'number' || length < 64 || length > 1024) {
            length = 64;
        }

        const bytes = crypto.randomBytes(Math.ceil(length * 0.75));
        let result = '';
        const prefix = `BOT_${Date.now() - WA_DEFAULT_EPOCH}_`;

        for (let i = 0; i < bytes.length; i++) {
            result += this.charPool[bytes[i] % this.charPool.length];
            if (result.length >= (length - prefix.length)) break;
        }

        return prefix + result.slice(0, length - prefix.length);
    }
}

export default new WABotSession();
