const { appointmentQueue } = require('../index');
const userService = require('../../../services/user.service');
const motorService = require('../../../services/motor.service');
const motorTempService = require('../../../services/motorTemp.service');
const emailService = require('../../../services/email.service');

appointmentQueue.process(async (job) => {
    try {
        const { appointment_date, appointment_time, motor_id, content, user_id } = job.data;
        console.log(`Processing appointment for user ${user_id}`);

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
        await emailService.sentEmailCreateAppointment(existedUser.email, appointment_date, appointment_time);

        console.log(`Appointment created successfully for user ${user_id}`);
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