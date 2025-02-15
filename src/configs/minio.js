const Minio = require('minio');
const { config } = require('dotenv');

config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD,
});

minioClient.makeBucket(process.env.MINIO_BUCKET_NAME, 'us-east-1', function (err) {
    if (err && err.code !== 'BucketAlreadyOwnedByYou') {
        return console.log('Tạo Bucket thất bại: ', err);
    }
    console.log('Bucket đã được tạo hoặc đã tồn tại');
});

module.exports = minioClient;
