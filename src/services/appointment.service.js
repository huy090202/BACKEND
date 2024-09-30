const { omit } = require('lodash');
const db = require('../models/index');

// Create Appointment
const createAppointment = async (data) => {
    const appointment = await db.Appointment.create(data);
    return omit(appointment.toJSON(), ['createdAt', 'updatedAt']);
};

// Find Appointment By Id
const findAppointmentById = async (id) => {
    const appointment = await db.Appointment.findOne({ where: { id } });
    return appointment;
};

// Update Appointment By Id
const updateAppointmentById = async (id, data) => {
    try {
        const appointment = await findAppointmentById(id);
        if (!appointment) return null;

        await appointment.update(data);
        return appointment;
    } catch (e) {
        console.error('Error updating appointment:', e);
        throw new Error('Failed to update appointment');
    }
};

// Get All Appointments
const findAppointments = async ({ offset, limit }) => {
    const appointments = await db.Appointment.findAndCountAll({
        offset,
        limit
    });
    return appointments;
};

// Public - Get All Appointments
const findAppointmentsPublic = async ({ id, offset, limit }) => {
    const appointments = await db.Appointment.findAndCountAll({
        where: { user_id: id },
        offset,
        limit
    });
    return appointments;
};

// Change Appointment Status
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