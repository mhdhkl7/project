// server.js

// 1. Impor library
// Hanya jalankan dotenv jika kita TIDAK di lingkungan 'production'
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const crypto = require('crypto');
const path = require('path');

// 2. Konfigurasi Aplikasi dan Cloudinary
const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 3. Konfigurasi Multer untuk menyimpan file di memori (bukan di disk!)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 4. Middleware untuk menyajikan file statis dari folder 'public'
// ## BARIS INI YANG DIPERBAIKI: Menggunakan path absolut agar pasti ditemukan di Vercel ##
app.use(express.static(path.join(__dirname, 'public')));

// 5. "Database" di memori
const videoDatabase = {};

// 6. Fungsi untuk mengunggah stream ke Cloudinary
let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { resource_type: 'video' }, // Pastikan kita bilang ini adalah video
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

// 7. Endpoint untuk proses upload
app.post('/upload', upload.single('videoFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
    }

    try {
        // Unggah file ke Cloudinary
        const result = await streamUpload(req);

        // Buat ID unik untuk video ini
        const videoId = crypto.randomBytes(6).toString('hex');

        // Simpan informasi video (sekarang URL dari Cloudinary) ke "database"
        videoDatabase[videoId] = {
            url: result.secure_url, // URL aman dari Cloudinary
            cloudinary_id: result.public_id,
            uploadDate: new Date()
        };

        // Link untuk dibagikan sekarang mengarah ke endpoint /video/ kita
        const shareableLink = `${req.protocol}://${req.get('host')}/video/${videoId}`;

        res.json({ success: true, link: shareableLink });

    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        res.status(500).json({ success: false, message: 'Gagal mengunggah video.' });
    }
});

// 8. Endpoint untuk menonton video (sekarang me-redirect ke Cloudinary)
app.get('/video/:id', (req, res) => {
    const videoId = req.params.id;
    const videoInfo = videoDatabase[videoId];

    if (!videoInfo) {
        return res.status(404).send('<h1>Video tidak ditemukan!</h1><p>Link mungkin salah atau video telah dihapus.</p>');
    }
    
    // Alihkan pengguna langsung ke URL video di Cloudinary
    res.redirect(videoInfo.url);
});

// 9. Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});