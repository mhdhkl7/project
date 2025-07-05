// server.js

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const cloudinary = require('cloudinary').v2;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Sajikan halaman HTML utama
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint BARU untuk membuat signature
app.get('/api/get-upload-signature', (req, res) => {
    const timestamp = Math.round((new Date).getTime() / 1000);

    // Buat signature menggunakan Cloudinary SDK
    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
    }, process.env.CLOUDINARY_API_SECRET);

    // Kirim signature, timestamp, dan api_key ke frontend
    res.json({
        signature: signature,
        timestamp: timestamp,
        api_key: process.env.CLOUDINARY_API_KEY
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});