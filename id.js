const crypto = require('crypto');
const { WA_DEFAULT_EPOCH } = require('./config'); // Your WhatsApp config

/**
 * WhatsApp Session ID Generator
 * Generates cryptographically secure IDs for bot sessions
 */
class WABotSession {
  constructor() {
    this.charPool = this.#initCharPool();
  }

  // Initialize WhatsApp-safe character pool
  #initCharPool() {
    const alphanum = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // WhatsApp-friendly chars
    const specials = '-_~.!$*'; // Safe special characters
    return alphanum + specials;
  }

  /**
   * Generate a WhatsApp-compatible session ID
   * @param {number} length - Default 500 as per WhatsApp requirements
   * @returns {string} Secure session ID
   */
  generate(length = 500) {
    if (length < 64 || length > 1024) {
      throw new Error('WhatsApp requires IDs between 64-1024 characters');
    }

    const bytes = crypto.randomBytes(Math.ceil(length * 0.75)); // Optimal byte calculation
    let sessionId = '';

    // WhatsApp-specific ID format: BOT<version>_<timestamp>_<random>
    const prefix = `BOT2_${Date.now() - WA_DEFAULT_EPOCH}_`;
    
    for (let i = 0; i < bytes.length; i++) {
      sessionId += this.charPool[bytes[i] % this.charPool.length];
      if (sessionId.length >= length - prefix.length) break;
    }

    return prefix + sessionId.substring(0, length - prefix.length);
  }

  /**
   * Generate multiple sessions for multi-device support
   * @param {number} count - Number of sessions to generate
   * @returns {string[]} Array of session IDs
   */
  generateBulk(count) {
    return Array.from({ length: count }, () => this.generate());
  }
}

// Singleton instance for the bot
module.exports = new WABotSession();
