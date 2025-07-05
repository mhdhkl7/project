// public/script.js

const videoFileInput = document.getElementById('videoFile');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const uploadBtn = document.querySelector('.upload-btn');

// GANTI DENGAN NAMA CLOUD-MU DARI CLOUDINARY
const CLOUD_NAME = 'djggsvjzm';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

videoFileInput.addEventListener('change', () => {
    const file = videoFileInput.files[0];
    if (file) {
        uploadFile(file);
    }
});

async function uploadFile(file) {
    loadingDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    uploadBtn.disabled = true;

    try {
        // 1. Dapatkan signature dari backend kita
        const signatureResponse = await fetch('/api/get-upload-signature');
        const signatureData = await signatureResponse.json();

        // 2. Siapkan data untuk diunggah ke Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.api_key);
        formData.append('timestamp', signatureData.timestamp);
        formData.append('signature', signatureData.signature);

        // 3. Unggah file LANGSUNG ke Cloudinary
        const cloudinaryResponse = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        const cloudinaryData = await cloudinaryResponse.json();

        if (cloudinaryData.error) {
            throw new Error(cloudinaryData.error.message);
        }

        // 4. Tampilkan link yang berhasil
        const shareableLink = cloudinaryData.secure_url;
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `Video berhasil diunggah! Bagikan link ini: <br> <a href="${shareableLink}" target="_blank">${shareableLink}</a>`;

    } catch (error) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `Gagal mengunggah: ${error.message}`;
        console.error('Error:', error);
    } finally {
        // Apapun yang terjadi, kembalikan UI ke keadaan normal
        loadingDiv.style.display = 'none';
        uploadBtn.disabled = false;
        videoFileInput.value = ''; // Reset input file
    }
}