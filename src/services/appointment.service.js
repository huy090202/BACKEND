const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một lịch hẹn mới
const createAppointment = async (data) => {
    const appointment = await db.Appointment.create(data);
    return omit(appointment.toJSON(), ['createdAt', 'updatedAt']);
};

// Tìm một lịch hẹn theo id
const findAppointmentById = async (id) => {
    const appointment = await db.Appointment.findByPk(id);
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

// Xóa lịch hẹn đã hoàn tất theo id
const deleteAppointmentById = async (id) => {
    return await db.Appointment.destroy({ where: { id } });
};

// Admin - Lấy tất cả lịch hẹn
const findAppointments = async ({ offset, limit }) => {
    const appointments = await db.Appointment.findAll({
        offset,
        limit,
        include: [
            {
                // Lấy thông tin người dùng thông qua associated với lịch hẹn
                model: db.User,
                as: 'user',
                attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'gender', 'address']
            },
            {
                // Lấy thông tin xe thông qua associated với lịch hẹn
                model: db.Motor,
                as: 'motor',
                attributes: ['id', 'motor_name', 'motor_type', 'motor_color', 'license_plate', 'engine_number', 'chassis_number', 'motor_model', 'created_at']
            },
            {
                // Lấy thông tin hình ảnh lịch hẹn thông qua associated với lịch hẹn
                model: db.AppointmentImage,
                as: 'images',
                attributes: ['id', 'image_url']
            }
        ],
        attributes: ['id', 'appointment_date', 'appointment_time', 'content', 'image_url', 'status', 'created_at', 'user_id', 'motor_id']
    });

    const totalAppointments = await db.Appointment.count();
    return {
        rows: appointments,
        count: totalAppointments
    }
};

// Public - Lấy tất cả lịch hẹn của người dùng
const findAppointmentsPublic = async ({ id, offset, limit }) => {
    const appointments = await db.Appointment.findAll({
        where: { user_id: id },
        offset,
        limit,
        include: [
            {
                // Lấy thông tin người dùng thông qua associated với lịch hẹn
                model: db.User,
                as: 'user',
                attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'gender', 'address']
            },
            {
                // Lấy thông tin xe thông qua associated với lịch hẹn
                model: db.Motor,
                as: 'motor',
                attributes: ['id', 'motor_name', 'motor_type', 'motor_color', 'license_plate', 'engine_number', 'chassis_number', 'motor_model', 'created_at']
            },
            {
                // Lấy thông tin hình ảnh lịch hẹn thông qua associated với lịch hẹn
                model: db.AppointmentImage,
                as: 'images',
                attributes: ['id', 'image_url']
            }
        ],
        attributes: ['id', 'appointment_date', 'appointment_time', 'content', 'image_url', 'status', 'created_at', 'user_id', 'motor_id']
    });
    const totalAppointments = await db.Appointment.count();
    return {
        rows: appointments,
        count: totalAppointments
    }
};

// Lấy danh sách đơn bảo dưỡng theo id người dùng thông qua appointment
const findMaintenancesByUserIdWithAppointment = async ({ id, offset, limit }) => {
    const maintenanes = await db.Appointment.findAll({
        where: { user_id: id },
        offset,
        limit,
        include: [
            {
                // Lấy thông tin bảo dưỡng thông qua associated với lịch hẹn
                model: db.Maintenance,
                as: 'maintenance',
                include: [
                    {
                        // Lấy thông tin chi tiết bảo dưỡng thông qua associated với đơn bảo dưỡng
                        model: db.MaintenanceDetail,
                        as: 'maintenanceDetails',
                        include: [
                            {
                                // Lấy thông tin phụ tùng thông qua associated với chi tiết bảo dưỡng
                                model: db.MotorcycleParts,
                                as: 'part'
                            }
                        ]
                    },
                    {
                        // Lấy thông tin xe thông qua associated với đơn bảo dưỡng
                        model: db.Motor,
                        as: 'motor',
                        attributes: ['id', 'motor_name', 'motor_type', 'motor_color', 'license_plate', 'engine_number', 'chassis_number', 'motor_model', 'created_at']
                    },
                    {
                        // Lấy thông tin người dùng ( role = technician) thông qua associated với đơn bảo dưỡng
                        model: db.User,
                        as: 'user',
                        attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber']
                    },
                    {
                        // Lấy thông tin lịch hẹn thông qua associated với đơn bảo dưỡng
                        model: db.Appointment,
                        as: 'appointment',
                        include: [
                            {
                                // Lấy thông tin hình ảnh lịch hẹn thông qua associated với lịch hẹn
                                model: db.AppointmentImage,
                                as: 'images',
                                attributes: ['id', 'image_url']
                            }
                        ],
                        attributes: ['id']
                    }
                ]
            }
        ],
        attributes: ['id', 'user_id', 'motor_id']
    });
    return maintenanes.rows.map(data => data.maintenance);
};

// Thay đổi trạng thái lịch hẹn
const changeAppointmentStatus = async (id, status) => {
    return await db.Appointment.update(status, { where: { id } });
};

module.exports = {
    createAppointment,
    findAppointmentById,
    updateAppointmentById,
    deleteAppointmentById,
    findAppointments,
    changeAppointmentStatus,
    findAppointmentsPublic,
    findMaintenancesByUserIdWithAppointment
};