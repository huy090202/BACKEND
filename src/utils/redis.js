const { createClient } = require('redis');
const { config } = require('dotenv');

config();

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

const redisConnection = async () => {
    try {
        await redisClient.connect();
        console.log('Kết nối Redis thành công');
    } catch (error) {
        console.error('Kết nối Redis thất bại', error.message);
    }
};

redisConnection();
redisClient.on('error', (error) => console.error('Lỗi Redis', error));

module.exports = redisClient;