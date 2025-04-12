const crypto = require('crypto');
const WA_DEFAULT_EPOCH = process.env.WA_EPOCH || 1672531200; // Jan 1, 2023 as default

class WABotSession {
    constructor() {
        if (!WA_DEFAULT_EPOCH || isNaN(WA_DEFAULT_EPOCH)) {
            throw new Error('Invalid WA_DEFAULT_EPOCH');
        }
        this.charPool = this.#initCharPool();
    }

    #initCharPool() {
        const alphanum = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const specials = '-_~.!$*';
        return alphanum + specials;
    }

    generate(length = 500) {
        if (typeof length !== 'number' || length < 64 || length > 1024) {
            throw new Error('Invalid length: must be between 64-1024 characters');
        }

        const bytes = crypto.randomBytes(Math.ceil(length * 0.75));
        let sessionId = '';
        const prefix = `BOT2_${Date.now() - WA_DEFAULT_EPOCH}_`;

        for (let i = 0; i < bytes.length; i++) {
            sessionId += this.charPool[bytes[i] % this.charPool.length];
            if (sessionId.length >= length - prefix.length) break;
        }

        return prefix + sessionId.substring(0, length - prefix.length);
    }

    generateBulk(count) {
        if (typeof count !== 'number' || count <= 0 || count > 100) {
            throw new Error('Invalid count: must be between 1-100');
        }
        return Array.from({ length: count }, () => this.generate());
    }
}

module.exports = new WABotSession();
