const appointmentService = require('../services/appointment.service');
const userService = require('../services/user.service');
const motorService = require('../services/motor.service');
const { APPOINTMENT_STATUS_CODE } = require('../utils/appointment');

// Tạo một lịch hẹn mới
const createAppointmentHandler = async (req, res) => {
    const { id } = req.user;
    const { appointment_date, created_at, motor_id } = req.body;
    if (!appointment_date || !motor_id) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        });
    }

    // Năm - Tháng - Ngày
    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    const appointmentDate = new Date(appointment_date);
    if (createdAtDate < currentDate) {
        return res.status(400).json({
            status: false,
            message: "Ngày tạo không thể ở quá khứ",
            data: {}
        });
    }

    if (appointmentDate < currentDate) {
        return res.status(400).json({
            status: false,
            message: "Ngày hẹn không thể ở quá khứ",
            data: {}
        });
    }

    const existedUser = await userService.getUserProfile(id);
    if (!existedUser) {
        return res.status(400).json({
            status: false,
            message: "Người dùng không tồn tại",
            data: {}
        })
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
        appointment_date,
        user_id: id,
        motor_id
    });
    return res.status(200).json({
        status: true,
        message: "Lịch hẹn đã được tạo thành công",
        data: appointment
    });
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

    const { appointment_date, created_at, motor_id } = req.body;
    if (!appointment_date || !motor_id) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        });
    }

    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    const appointmentDate = new Date(appointment_date);
    if (createdAtDate < currentDate) {
        return res.status(400).json({
            status: false,
            message: "Ngày tạo không thể ở quá khứ",
            data: {}
        });
    }

    if (appointmentDate < currentDate) {
        return res.status(400).json({
            status: false,
            message: "Ngày hẹn không thể ở quá khứ",
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

    if (existedAppointment.status === APPOINTMENT_STATUS_CODE.CONFIRMED || existedAppointment.status === APPOINTMENT_STATUS_CODE.COMPLETED) {
        return res.status(400).json({
            status: false,
            message: "Không thể cập nhật lịch hẹn đã được xác nhận hoặc hoàn thành",
            data: {}
        });
    }

    const appointment = await appointmentService.updateAppointmentById(id, req.body);
    return res.status(200).json({
        status: true,
        message: "Lịch hẹn đã được cập nhật thành công",
        data: appointment
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
    if (![APPOINTMENT_STATUS_CODE.PENDING, APPOINTMENT_STATUS_CODE.CONFIRMED, APPOINTMENT_STATUS_CODE.COMPLETED].includes(status)) {
        return res.status(400).json({
            status: false,
            message: "Trạng thái không hợp lệ",
        });
    }

    let statusVar = 'PENDING';
    if (status === 'CONFIRMED') {
        statusVar = 'CONFIRMED';
        await appointmentService.changeAppointmentStatus(id, { status: statusVar });
        return res.status(200).json({
            status: true,
            message: "Lịch hẹn đã được xác nhận",
            data: {}
        });
    } else if (status === 'COMPLETED') {
        statusVar = 'COMPLETED'
        await appointmentService.changeAppointmentStatus(id, { status: statusVar });
        return res.status(200).json({
            status: true,
            message: "Lịch hẹn đã được hoàn thành",
            data: {}
        });
    } else if (status === 'PENDING') {
        statusVar = 'PENDING'
        await appointmentService.changeAppointmentStatus(id, { status: statusVar });
        return res.status(200).json({
            status: true,
            message: "Lịch hẹn đã được chuyển về trạng thái chờ xác nhận",
            data: {}
        });
    }
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

module.exports = {
    createAppointmentHandler,
    updateAppointmentByIdHandler,
    changeAppointmentStatusHandler,
    getAppointmentByIdHandler,
    getAllAppointmentsHandler,
    allAppointmentsHandler
};