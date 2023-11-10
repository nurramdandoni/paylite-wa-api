const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

const client = new Client({
    authStrategy:new LocalAuth(),
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});



client.initialize();

// Endpoint untuk mengirim pesan ke nomor tertentu
app.post('/sendMessage', async (req, res) => {
    const { phoneNumber, message } = req.body;

    try {
        // Tunggu hingga klien WhatsApp sepenuhnya siap
        // await client.waitForQRCodeScan(); // Pastikan klien telah memindai QR code
        // await client.waitForLogin(); // Pastikan klien telah login

        const chatId = `${phoneNumber}@c.us`;
        
        client.sendMessage(chatId,message);
        // // Periksa apakah nomor tersebut ada dalam kontak
        // const contact = await client.getContactById(chatId);
        // if (!contact) {
        //     throw new Error(`Kontak dengan nomor ${phoneNumber} tidak ditemukan.`);
        // }

        // // Kirim pesan
        // const chat = await client.getChatById(chatId);
        // await chat.sendMessage(message);

        res.json({ success: true, message: 'Pesan berhasil dikirim.' });
    } catch (error) {
        res.status(500).json({ success: false, error: `Gagal mengirim pesan: ${error.message}` });
    }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});