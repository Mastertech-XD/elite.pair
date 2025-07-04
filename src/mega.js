const mega = require("megajs");

// Configure your MEGA.nz credentials
const auth = {
    email: 'your_mega_email@example.com', // Replace with your MEGA email
    password: 'your_mega_password',      // Replace with your MEGA password
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function upload(fileStream, filename) {
    return new Promise((resolve, reject) => {
        try {
            const storage = new mega.Storage(auth, (err) => {
                if (err) return reject(err);
                
                const uploadOptions = {
                    name: filename,
                    target: storage.root,
                    allowUploadBuffering: true
                };

                fileStream.pipe(storage.upload(uploadOptions, (err, file) => {
                    if (err) return reject(err);
                    
                    file.link((err, link) => {
                        if (err) return reject(err);
                        resolve(link);
                    });
                });
            });
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { upload };
