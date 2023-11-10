const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

const clients = {};

function createClient(clientId) {
    clients[clientId] = new Client({
        authStrategy: new LocalAuth({ clientId })
    });

    clients[clientId].on('qr', (qr) => {
        console.log(`QR RECEIVED for ${clientId}`, qr);
        qrcode.generate(qr, { small: true });
    });

    clients[clientId].on('ready', () => {
        console.log(`Client ${clientId} is ready!`);
    });

    clients[clientId].on('message', msg => {
        if (msg.body == '!ping') {
            msg.reply('pong');
        }
    });

    clients[clientId].initialize();
}

// Buat dua klien dengan ID yang berbeda
// createClient("client-one");
// createClient("client-two");

// Endpoint untuk membuat klien baru
app.post('/createClient', async (req, res) => {
    const { clientId } = req.body;

    if (clients[clientId]) {
        return res.status(400).json({ success: false, error: `Client dengan ID ${clientId} sudah ada.` });
    }

    // Panggil fungsi createClient dan tunggu hingga klien siap
    try {
        await new Promise(resolve => {
            createClient(clientId);
            clients[clientId].on('ready', () => resolve());
        });

        return res.json({ success: true, message: `Client dengan ID ${clientId} berhasil dibuat dan siap.` });
    } catch (error) {
        return res.status(500).json({ success: false, error: `Gagal membuat klien: ${error.message}` });
    }
});

// Endpoint untuk memeriksa apakah klien siap atau tidak
app.post('/isClientRead', (req, res) => {
    const { clientId } = req.body;

    if (!clients[clientId]) {
        return res.status(404).json({ success: false, error: `Client dengan ID ${clientId} tidak ditemukan.` });
    }

    return res.json({ success: true, isReady: clients[clientId].isConnected() });
});

// Endpoint untuk mengirim pesan ke nomor tertentu untuk klien tertentu
app.post('/sendMessage', async (req, res) => {
    const { clientId, phoneNumber, message } = req.body;

    try {
        const chatId = `${phoneNumber}@c.us`;

        if (!clients[clientId]) {
            throw new Error(`Client dengan ID ${clientId} tidak ditemukan.`);
        }

        // Tunggu hingga klien WhatsApp sepenuhnya siap
        // await clients[clientId].waitForQRCodeScan();
        // await clients[clientId].waitForLogin();

        // Kirim pesan
        clients[clientId].sendMessage(chatId, message);

        res.json({ success: true, message: 'Pesan berhasil dikirim.' });
    } catch (error) {
        res.status(500).json({ success: false, error: `Gagal mengirim pesan: ${error.message}` });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});
