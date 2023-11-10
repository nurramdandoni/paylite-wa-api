const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const WebSocket = require('ws');

const client = new Client();
const wss = new WebSocket.Server({ port: 8080 }); // Ganti dengan port yang Anda inginkan

client.on('message', (message) => {
  // Kirim pesan ke WebSocket saat menerima pesan
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
});

// ... kode lainnya

