const appointmentService = require('../services/appointment.service');
const userService = require('../services/user.service');
const motorService = require('../services/motor.service');
const motorTempService = require('../services/motorTemp.service');
const emailService = require('../services/email.service');
const { APPOINTMENT_STATUS_CODE } = require('../utils/appointment');

// Tạo một lịch hẹn mới
const createAppointmentHandler = async (req, res) => {
    try {
        const { appointment_date, appointment_time, created_at, motor_id, content, user_id } = req.body;
        if (!appointment_date || !appointment_time || !user_id) {
            return res.status(400).json({
                status: false,
                message: "Các trường bắt buộc không được để trống",
                data: {}
            });
        }

        // Kiểm tra ngày và thời gian hẹn bảo dưỡng
        const errorMessage = await validateAppointmentDateAndTime(appointment_date, appointment_time, created_at);
        if (errorMessage) {
            return res.status(400).json({
                status: false,
                message: errorMessage,
                data: {}
            });
        }

        const existedUser = await userService.getUserProfile(user_id);
        if (!existedUser) {
            return res.status(400).json({
                status: false,
                message: "Người dùng không tồn tại",
                data: {}
            })
        }

        // Nếu không có xe nào được chọn hoặc khách hàng chưa có xe nào
        if (!motor_id) {
            // Hiển thị ra tất cả xe tạm để kiểm tra xem có xe nào có email trùng với existedUser.email không?
            const motorTemps = await motorTempService.findMotorTemps();

            // Tìm xe tạm nào có email trùng với email của existedUser
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

                const existedMotor = await motorService.findMotorById(newMotor.id);
                if (!existedMotor) {
                    return res.status(400).json({
                        status: false,
                        message: "Xe không tồn tại",
                        data: {}
                    })
                }

                const appointment = await appointmentService.createAppointment({
                    appointment_date, // YYYY-MM-DD
                    appointment_time, // HH:MM:SS
                    user_id,
                    motor_id: existedMotor.id,
                    content
                });

                await motorTempService.deleteMotorTempById(matchedMotorTemp.id);

                // Gửi email thông báo tạo lịch hẹn thành công
                await emailService.sentEmailCreateAppointment(existedUser.email, appointment.appointment_date, appointment.appointment_time);

                if (!appointment) {
                    return res.status(500).json({
                        status: false,
                        message: "Lỗi khi tạo lịch hẹn",
                        data: {}
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: "Lịch hẹn đã được tạo thành công",
                    data: appointment
                });
            }
        }

        const existedMotor = await motorService.findMotorById(motor_id);
        if (!existedMotor) {
            return res.status(400).json({
                status: false,
                message: "Xe không tồn tại",
                data: {}
            })
        }

        const appointment = await appointmentService.createAppointment({
            appointment_date, // YYYY-MM-DD
            appointment_time, // HH:MM:SS
            user_id,
            motor_id,
            content
        });

        // Gửi email thông báo tạo lịch hẹn thành công
        await emailService.sentEmailCreateAppointment(existedUser.email, appointment.appointment_date, appointment.appointment_time);

        if (!appointment) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi tạo lịch hẹn",
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: "Lịch hẹn đã được tạo thành công",
            data: appointment
        });
    } catch (err) {
        console.log("Có lỗi xảy ra khi tạo lịch hẹn: ", err.message);
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi tạo lịch hẹn",
            data: {}
        });
    }
};

// Cập nhật lịch hẹn theo id
const updateAppointmentByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id lịch hẹn không được để trống",
            data: {}
        });
    }

    const { appointment_date, appointment_time, created_at, motor_id, content } = req.body;

    if (!appointment_date || !appointment_time || !motor_id) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        });
    }

    // Kiểm tra ngày và thời gian hẹn bảo dưỡng
    const errorMessage = await validateAppointmentDateAndTime(appointment_date, appointment_time, created_at);
    if (errorMessage) {
        return res.status(400).json({
            status: false,
            message: errorMessage,
            data: {}
        });
    }

    const existedAppointment = await appointmentService.findAppointmentById(id);
    if (!existedAppointment) {
        return res.status(404).json({
            status: false,
            message: `Lịch hẹn '${id}' không tồn tại`,
        })
    }

    if (existedAppointment.status === APPOINTMENT_STATUS_CODE['CONFIRMED'] || existedAppointment.status === APPOINTMENT_STATUS_CODE['COMPLETED']) {
        return res.status(400).json({
            status: false,
            message: "Không thể cập nhật lịch hẹn đã được xác nhận hoặc hoàn thành",
            data: {}
        });
    }

    const appointment = await appointmentService.updateAppointmentById(id, {
        appointment_date, // YYYY-MM-DD
        appointment_time, // HH:MM:SS
        motor_id,
        content,
    });

    if (!appointment) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi cập nhật lịch hẹn",
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: "Lịch hẹn đã được cập nhật thành công",
        data: appointment
    });
};

// Xóa lịch hẹn đã hoàn tất bảo dưỡng theo id
const deleteAppointmentByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id lịch hẹn không được để trống",
            data: {}
        });
    }

    const existedAppointment = await appointmentService.findAppointmentById(id);
    if (!existedAppointment) {
        return res.status(404).json({
            status: false,
            message: `Lịch hẹn '${id}' không tồn tại`,
        })
    }

    // Kiểm tra trạng thái lịch hẹn
    if (existedAppointment.status !== APPOINTMENT_STATUS_CODE['COMPLETED']) {
        return res.status(400).json({
            status: false,
            message: "Không thể xoá lịch hẹn chưa hoàn tất bảo dưỡng",
            data: {}
        });
    };

    const appointmentImage = await appointmentService.deleteAppointmentById(id);
    if (!appointmentImage) {
        return res.status(500).json({
            status: false,
            message: `Lịch hẹn '${id}' không thể xoá`,
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: "Lịch hẹn đã được xoá thành công",
        data: {}
    });
};

// Thay đổi trạng thái lịch hẹn
const changeAppointmentStatusHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id lịch hẹn không được để trống",
            data: {}
        });
    }

    const existedAppointment = await appointmentService.findAppointmentById(id);
    if (!existedAppointment) {
        return res.status(404).json({
            status: false,
            message: `Lịch hẹn '${id}' không tồn tại`,
        })
    }

    const { status } = req.body;
    if (![APPOINTMENT_STATUS_CODE['PENDING'], APPOINTMENT_STATUS_CODE['CONFIRMED'], APPOINTMENT_STATUS_CODE['COMPLETED'], APPOINTMENT_STATUS_CODE['CANCEL']].includes(status)) {
        return res.status(400).json({
            status: false,
            message: "Trạng thái không hợp lệ",
        });
    }

    let statusVar = 'Chờ xác nhận';
    switch (status) {
        case APPOINTMENT_STATUS_CODE['CONFIRMED']:
            statusVar = 'Đã xác nhận';
            break;
        case APPOINTMENT_STATUS_CODE['COMPLETED']:
            statusVar = 'Đã hoàn thành';
            break;
        case APPOINTMENT_STATUS_CODE['CANCEL']:
            statusVar = 'Đã hủy';
            break;
        case APPOINTMENT_STATUS_CODE['PENDING']:
            statusVar = 'Chờ xác nhận';
            break;
        default:
            return res.status(400).json({
                status: false,
                message: "Trạng thái không hợp lệ",
            });
    }

    await appointmentService.changeAppointmentStatus(id, { status: statusVar });
    return res.status(200).json({
        status: true,
        message: `Lịch hẹn đã được ${statusVar.toLowerCase()}`,
        data: {}
    });
};

// Lấy thông tin lịch hẹn theo id
const getAppointmentByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id lịch hẹn không được để trống",
            data: {}
        });
    }

    const appointment = await appointmentService.findAppointmentById(id);
    if (!appointment) {
        return res.status(404).json({
            status: false,
            message: `Lịch hẹn '${id}' không tồn tại`,
        })
    }
    return res.status(200).json({
        status: true,
        message: "Lấy thông tin lịch hẹn thành công",
        data: appointment
    });
};

// Admin - Lấy tất cả lịch hẹn
const getAllAppointmentsHandler = async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let appointments = [];
    appointments = await appointmentService.findAppointments({ offset, limit: parseInt(limit) });
    return res.status(200).json({
        status: true,
        message: "Lấy tất cả lịch hẹn thành công",
        data: appointments.rows,
        total: appointments.count,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Public - Lấy tất cả lịch hẹn của người dùng
const allAppointmentsHandler = async (req, res) => {
    const { id } = req.user;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let appointments = [];
    appointments = await appointmentService.findAppointmentsPublic({ id, offset, limit: parseInt(limit) });
    return res.status(200).json({
        status: true,
        message: "Lấy tất cả lịch hẹn thành công",
        data: appointments.rows,
        total: appointments.count,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Kiểm tra ngày và thời gian hẹn bảo dưỡng
const validateAppointmentDateAndTime = async (appointment_date, appointment_time, created_at) => {
    // Ngày - Tháng - Năm (YYYY-MM-DD)
    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    const appointmentDate = new Date(appointment_date);

    if (createdAtDate < currentDate) {
        return "Ngày tạo không thể ở quá khứ";
    }

    if (appointmentDate < currentDate) {
        return "Ngày hẹn không thể ở quá khứ";
    }

    // Kiểm tra thời gian
    const currentSecondsOfDay = currentDate.getHours() * 3600 + currentDate.getMinutes() * 60 + currentDate.getSeconds();
    const appointmentTimeInSeconds = await convertTimeToSeconds(appointment_time);

    // Nếu ngày hẹn là ngày hôm nay, thì kiểm tra thêm giờ hẹn
    if (appointmentDate.toDateString() === currentDate.toDateString()) {
        if (appointmentTimeInSeconds <= currentSecondsOfDay) {
            return "Thời gian bắt đầu bảo dưỡng phải lớn hơn thời gian hiện tại";
        }
    }


    return null;
};


// Chuyển đổi thời gian thành tổng số giây
const convertTimeToSeconds = async (time) => {
    const [hours, minutes, seconds] = await time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + (seconds || 0);
};

module.exports = {
    createAppointmentHandler,
    updateAppointmentByIdHandler,
    deleteAppointmentByIdHandler,
    changeAppointmentStatusHandler,

    getAppointmentByIdHandler,
    getAllAppointmentsHandler,
    allAppointmentsHandler,

    validateAppointmentDateAndTime,
    convertTimeToSeconds,
};