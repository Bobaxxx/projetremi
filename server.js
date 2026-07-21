const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Twilio configuration — reads from environment variables (set in your hosting platform)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC7a6eb7a2c210e25cfbb67f5bc08c4a5d';
const TWILIO_AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN  || '4fc8c5a47b5fd5430cccdf05e6e17e17';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '+13854327129';

const PORT = process.env.PORT || 8080;

// MIME types dictionary for static file serving
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Helper function to serve static files
function serveStaticFile(res, filePath) {
    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Fichier introuvable');
            return;
        }

        // If it's a directory, serve index.html
        if (fs.statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Erreur interne du serveur');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
}

// Helper to make request to Twilio API
function sendTwilioSMS(to, body) {
    return new Promise((resolve, reject) => {
        const postData = `From=${encodeURIComponent(TWILIO_FROM_NUMBER)}&To=${encodeURIComponent(to)}&Body=${encodeURIComponent(body)}`;
        
        const options = {
            hostname: 'api.twilio.com',
            port: 443,
            path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => { responseBody += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseBody));
                } else {
                    reject(new Error(`Twilio error status ${res.statusCode}: ${responseBody}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(postData);
        req.end();
    });
}

const server = http.createServer((req, res) => {
    // 1. Handle API Route for bulk SMS sending
    if (req.method === 'POST' && req.url === '/api/send-sms-bulk') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                // payload: { messages: [ { to: '+33612345678', text: 'message text' }, ... ] }
                if (!payload || !Array.isArray(payload.messages)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Payload invalide. Un tableau "messages" est requis.' }));
                    return;
                }

                console.log(`\n--- Début de l'envoi de ${payload.messages.length} SMS en masse ---`);
                const results = [];
                for (const msg of payload.messages) {
                    try {
                        console.log(`Envoi à ${msg.to}...`);
                        const result = await sendTwilioSMS(msg.to, msg.text);
                        results.push({ to: msg.to, success: true, sid: result.sid });
                    } catch (error) {
                        console.error(`Échec d'envoi à ${msg.to}:`, error.message);
                        results.push({ to: msg.to, success: false, error: error.message });
                    }
                }
                console.log(`--- Fin de l'envoi en masse ---\n`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, results }));

            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // 2. Serve static files for everything else
    let filePath = '.' + req.url.split('?')[0];
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Resolve absolute path to make sure we don't access outside workspace
    const absolutePath = path.resolve(filePath);
    const workspaceRoot = path.resolve('.');
    
    if (!absolutePath.startsWith(workspaceRoot)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end("Accès interdit");
        return;
    }

    serveStaticFile(res, absolutePath);
});

server.listen(PORT, () => {
    console.log(`Serveur de planning en écoute locale sur : http://localhost:${PORT}`);
});
