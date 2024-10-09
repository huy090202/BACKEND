const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một lịch hẹn mới
const createAppointment = async (data) => {
    const appointment = await db.Appointment.create(data);
    return omit(appointment.toJSON(), ['createdAt', 'updatedAt']);
};

// Tìm một lịch hẹn theo id
const findAppointmentById = async (id) => {
    const appointment = await db.Appointment.findOne({ where: { id } });
    return appointment;
};

// Cập nhật lịch hẹn theo id
const updateAppointmentById = async (id, data) => {
    try {
        const appointment = await findAppointmentById(id);
        if (!appointment) return null;

        await appointment.update(data);
        return appointment;
    } catch (e) {
        console.error('Lỗi trong việc cập nhật lịch hẹn:', e);
        throw new Error('Có lỗi xảy ra khi cập nhật lịch hẹn');
    }
};

// Admin - Lấy tất cả lịch hẹn
const findAppointments = async ({ offset, limit }) => {
    const appointments = await db.Appointment.findAndCountAll({
        offset,
        limit
    });
    return appointments;
};

// Public - Lấy tất cả lịch hẹn của người dùng
const findAppointmentsPublic = async ({ id, offset, limit }) => {
    const appointments = await db.Appointment.findAndCountAll({
        where: { user_id: id },
        offset,
        limit
    });
    return appointments;
};

// Thay đổi trạng thái lịch hẹn
const changeAppointmentStatus = async (id, status) => {
    return await db.Appointment.update(status, { where: { id } });
};

module.exports = {
    createAppointment,
    findAppointmentById,
    updateAppointmentById,
    findAppointments,
    changeAppointmentStatus,
    findAppointmentsPublic
};