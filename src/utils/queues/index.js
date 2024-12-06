const Queue = require('bull');
const userService = require('../../services/user.service');
const motorService = require('../../services/motor.service');
const motorTempService = require('../../services/motorTemp.service');
const emailService = require('../../services/email.service');
const appointmentService = require('../../services/appointment.service');
const { config } = require('dotenv');

config();

const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
};

const defaultJobOptions = {
    attempts: 5, // Số lần thử lại khi job fail
    backoff: 1000, // Thời gian delay trước khi retry
    removeOnComplete: true, // Xoá job sau khi xử lý thành công
    removeOnFail: false, // Giữ job nếu thất bại
};

// Tạo hàng đợi
const orderQueue = new Queue('orderQueue', { redis: redisConfig, defaultJobOptions });
const appointmentQueue = new Queue('appointmentQueue', { redis: redisConfig, defaultJobOptions });

appointmentQueue.process(async (job) => {
    try {
        const { appointment_date, appointment_time, motor_id, content, user_id } = job.data;
        console.log('Bắt đầu xử lý lịch hẹn bảo dưỡng');

        // Kiểm tra người dùng
        const existedUser = await userService.getUserProfile(user_id);
        if (!existedUser) {
            throw new Error("Người dùng không tồn tại");
        }

        let finalMotorId = motor_id;

        // Xử lý logic xe nếu motor_id không được cung cấp
        if (!motor_id) {
            const motorTemps = await motorTempService.findMotorTemps();
            const matchedMotorTemp = motorTemps.rows.find(item => item.email === existedUser.email);

            if (matchedMotorTemp) {
                const newMotor = await motorService.createMotor({
                    motor_name: matchedMotorTemp.motor_name,
                    motor_type: matchedMotorTemp.motor_type,
                    motor_color: matchedMotorTemp.motor_color,
                    license_plate: matchedMotorTemp.license_plate,
                    engine_number: matchedMotorTemp.engine_number,
                    chassis_number: matchedMotorTemp.chassis_number,
                    motor_model: matchedMotorTemp.motor_model,
                    created_at: matchedMotorTemp.created_at,
                    user_id: user_id
                });

                await motorTempService.deleteMotorTempById(matchedMotorTemp.id);
                finalMotorId = newMotor.id;
            } else {
                throw new Error("Không tìm thấy xe phù hợp");
            }
        }

        // Tạo lịch hẹn bảo dưỡng
        const appointment = await appointmentService.createAppointment({
            appointment_date,
            appointment_time,
            user_id,
            motor_id: finalMotorId,
            content
        });

        // Gửi email thông báo
        await emailService.sentEmailCreateAppointment(existedUser.email, appointment.appointment_date, appointment.appointment_time);

        console.log(`Đã tạo thành công lịch hẹn cho: ${existedUser.email}`);
        return appointment.id;
    } catch (err) {
        console.error(`Job appointmentQueue thất bại: ${job.id} - Error: ${err.message}`);
        throw err;
    }
});

appointmentQueue.on('completed', (job) => {
    console.log(`Job appointmentQueue đã hoàn thành: ${job.id}`);
});

appointmentQueue.on('failed', (job, error) => {
    console.error(`Job appointmentQueue thất bại: ${job.id} - Error: ${error.message}`);
});

// Xử lý sự kiện hoàn thành và thất bại
orderQueue.on('completed', (job) => {
    console.log(`Job orderQueue đã hoàn thành: ${job.id}`);
});

orderQueue.on('failed', (job, error) => {
    console.error(`Job orderQueue thất bại: ${job.id} - Error: ${error.message}`);
});

module.exports = { orderQueue, appointmentQueue };
