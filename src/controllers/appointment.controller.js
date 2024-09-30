const appointmentService = require('../services/appointment.service');
const userService = require('../services/user.service');
const motorService = require('../services/motor.service');
const { APPOINTMENT_STATUS_CODE } = require('../utils/appointment');

// Create Appointment
const createAppointmentHandler = async (req, res) => {
    const { id } = req.user;
    const { appointment_date, created_at, motor_id } = req.body;
    if (!appointment_date || !motor_id) {
        return res.status(400).json({
            status: false,
            message: "Required fields must not be empty",
            data: {}
        });
    }

    // yyyy-mm-dd
    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    const appointmentDate = new Date(appointment_date);
    if (createdAtDate < currentDate) {
        return res.status(400).json({
            status: false,
            message: "Created date cannot be in the past",
            data: {}
        });
    }

    if (appointmentDate < currentDate) {
        return res.status(400).json({
            status: false,
            message: "Appointment date cannot be in the past",
            data: {}
        });
    }

    const existedUser = await userService.getUserProfile(id);
    if (!existedUser) {
        return res.status(400).json({
            status: false,
            message: "User not found",
            data: {}
        })
    }

    const existedMotor = await motorService.findMotorById(motor_id);
    if (!existedMotor) {
        return res.status(400).json({
            status: false,
            message: "Motor not found",
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
        message: "Appointment created successfully",
        data: appointment
    });
};

// Update Appointment By Id
const updateAppointmentByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        });
    }

    const { appointment_date, created_at, motor_id } = req.body;
    if (!appointment_date || !motor_id) {
        return res.status(400).json({
            status: false,
            message: "Required fields must not be empty",
            data: {}
        });
    }

    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    const appointmentDate = new Date(appointment_date);
    if (createdAtDate < currentDate) {
        return res.status(400).json({
            status: false,
            message: "Created date cannot be in the past",
            data: {}
        });
    }

    if (appointmentDate < currentDate) {
        return res.status(400).json({
            status: false,
            message: "Appointment date cannot be in the past",
            data: {}
        });
    }

    const existedAppointment = await appointmentService.findAppointmentById(id);
    if (!existedAppointment) {
        return res.status(404).json({
            status: false,
            message: `Appointment '${id}' does not existed`,
        })
    }

    if (existedAppointment.status === APPOINTMENT_STATUS_CODE.CONFIRMED || existedAppointment.status === APPOINTMENT_STATUS_CODE.COMPLETED) {
        return res.status(400).json({
            status: false,
            message: "Appointment is already confirmed or completed",
            data: {}
        });
    }

    const appointment = await appointmentService.updateAppointmentById(id, req.body);
    return res.status(200).json({
        status: true,
        message: "Appointment updated successfully",
        data: appointment
    });
};

// Change Appointment Status
const changeAppointmentStatusHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        });
    }

    const existedAppointment = await appointmentService.findAppointmentById(id);
    if (!existedAppointment) {
        return res.status(404).json({
            status: false,
            message: `Appointment '${id}' does not existed`,
        })
    }

    const { status } = req.body;
    if (![APPOINTMENT_STATUS_CODE.PENDING, APPOINTMENT_STATUS_CODE.CONFIRMED, APPOINTMENT_STATUS_CODE.COMPLETED].includes(status)) {
        return res.status(400).json({
            status: false,
            message: "Invalid status value",
        });
    }

    let statusVar = 'PENDING';
    if (status === 'CONFIRMED') {
        statusVar = 'CONFIRMED';
        await appointmentService.changeAppointmentStatus(id, { status: statusVar });
        return res.status(200).json({
            status: true,
            message: "Appointment status is confirmed",
            data: {}
        });
    } else if (status === 'COMPLETED') {
        statusVar = 'COMPLETED'
        await appointmentService.changeAppointmentStatus(id, { status: statusVar });
        return res.status(200).json({
            status: true,
            message: "Appointment status is completed",
            data: {}
        });
    } else if (status === 'PENDING') {
        statusVar = 'PENDING'
        await appointmentService.changeAppointmentStatus(id, { status: statusVar });
        return res.status(200).json({
            status: true,
            message: "Appointment status is pending",
            data: {}
        });
    }
};

// Get Appointment By Id
const getAppointmentByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        });
    }

    const appointment = await appointmentService.findAppointmentById(id);
    if (!appointment) {
        return res.status(404).json({
            status: false,
            message: `Appointment '${id}' does not existed`,
        })
    }
    return res.status(200).json({
        status: true,
        message: "Appointment found",
        data: appointment
    });
};

// Get All Appointments
const getAllAppointmentsHandler = async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let appointments = [];
    appointments = await appointmentService.findAppointments({ offset, limit: parseInt(limit) });
    return res.status(200).json({
        status: true,
        message: "Success",
        data: appointments.rows,
        total: appointments.count,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Public - Get All Appointments
const allAppointmentsHandler = async (req, res) => {
    const { id } = req.user;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let appointments = [];
    appointments = await appointmentService.findAppointmentsPublic({ id, offset, limit: parseInt(limit) });
    return res.status(200).json({
        status: true,
        message: "Success",
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