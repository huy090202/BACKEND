const multer = require("multer");
const minioClient = require('../configs/minio');
const path = require('path');

// Sử dụng multer để lưu file ảnh vào bộ nhớ tạm
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// Hàm upload file lên Minio
const uploadToMinio = (file) => {
    return new Promise((resolve, reject) => {
        const fileName = Date.now() + path.extname(file.originalname);
        const contentType = file.mimetype;
        minioClient.putObject(process.env.MINIO_BUCKET_NAME, fileName, file.buffer, file.size, { 'Content-Type': contentType }, function (err, etag) {
            if (err) {
                return reject(err);
            }
            const fileUrl = `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET_NAME}/${fileName}`;
            resolve(fileUrl);
        });
    });
};

module.exports = { upload, uploadToMinio };
