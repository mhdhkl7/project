// script.js

// Ambil elemen-elemen HTML yang kita butuhkan
const videoFileInput = document.getElementById('videoFile');
const uploadForm = document.getElementById('uploadForm');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');

// Tambahkan 'event listener' saat pengguna memilih file
videoFileInput.addEventListener('change', () => {
    // Ambil file yang dipilih
    const file = videoFileInput.files[0];
    if (file) {
        // Jika ada file, langsung mulai proses upload
        uploadFile(file);
    }
});

// Fungsi untuk meng-handle upload file ke server
async function uploadFile(file) {
    // Tampilkan pesan loading dan sembunyikan hasil sebelumnya
    loadingDiv.style.display = 'block';
    resultDiv.style.display = 'none';

    // Buat objek FormData untuk mengirim file
    const formData = new FormData();
    formData.append('videoFile', file); // 'videoFile' harus sama dengan yang di-handle Multer di backend

    try {
        // Kirim request POST ke endpoint /upload di server kita
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        // Ubah respons dari server menjadi format JSON
        const data = await response.json();

        // Sembunyikan pesan loading
        loadingDiv.style.display = 'none';

        if (data.success) {
            // Jika upload berhasil, tampilkan link-nya
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `Video berhasil diunggah! Bagikan link ini: <br> <a href="${data.link}" target="_blank">${data.link}</a>`;
        } else {
            // Jika gagal, tampilkan pesan error
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `Gagal mengunggah: ${data.message}`;
        }

    } catch (error) {
        // Tangani jika ada error jaringan atau server
        loadingDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `Terjadi kesalahan. Silakan coba lagi.`;
        console.error('Error:', error);
    }
}