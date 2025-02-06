const Queue = require('bull');
const { config } = require('dotenv');
const processOrder = require('./processOrder');
const processAppointment = require('./processAppointment');

config();

const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
};

const orderQueue = new Queue('orderQueue', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 5, // Số lần thử lại khi job fail
        backoff: 1000, // Thời gian delay trước khi retry
        removeOnComplete: true, // Xoá job sau khi xử lý thành công
        removeOnFail: false, // Giữ job nếu thất bại
    },
});
const appointmentQueue = new Queue('appointmentQueue', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 5,
        backoff: 1000,
        removeOnComplete: true,
        removeOnFail: false,
    },
});

orderQueue.process(processOrder);
appointmentQueue.process(processAppointment)

orderQueue.on('completed', (job) => {
    console.log(`Job orderQueue đã hoàn thành`);
});

orderQueue.on('failed', (job, error) => {
    console.error(`Job orderQueue thất bại: ${error.message}`);
});

appointmentQueue.on('completed', (job) => {
    console.log(`Job appointmentQueue đã hoàn thành`);
});

appointmentQueue.on('failed', (job, error) => {
    console.error(`Job appointmentQueue thất bại: ${error.message}`);
});

module.exports = { orderQueue, appointmentQueue };