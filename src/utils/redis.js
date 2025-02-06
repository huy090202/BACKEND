const { createClient } = require('redis');
const { config } = require('dotenv');

config();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});

const redisConnection = async () => {
    try {
        await redisClient.connect();
        console.log('Kết nối Redis thành công');
    } catch (error) {
        console.error('Kết nối Redis thất bại', error.message);
    }
};

redisClient.on('connect', () => console.log('🔗 Redis client đã kết nối!'));
redisClient.on('ready', () => console.log('🎉 Redis client đã sẵn sàng!'));
redisClient.on('end', () => console.log('🔌 Redis client đã ngắt kết nối!'));
redisClient.on('reconnecting', () => console.log('🔄 Redis client đang thử kết nối lại...'));
redisClient.on('error', (error) => console.error('⚠️ Lỗi Redis client:', error));

redisConnection();

module.exports = redisClient;