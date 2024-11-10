const Bull = require('bull');
const { config } = require('dotenv');

config();

const orderQueue = new Bull('order-queue', {
    redis: process.env.REDIS_URL,
});

module.exports = {
    orderQueue,
};