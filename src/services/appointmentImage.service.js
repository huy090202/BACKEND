const { omit } = require('lodash');
const db = require('../models/index');

// Tạo mới một ảnh tình trạng xe cho lịch hẹn
const createAppointmentImage = async (data) => {
    const appointmentImage = await db.AppointmentImage.create(data);
    return omit(appointmentImage.toJSON(), ['createdAt', 'updatedAt']);
};

// Tìm một ảnh tình trạng xe theo id
const findAppointmentImageById = async (id) => {
    const appointmentImage = await db.AppointmentImage.findOne({ where: { id } });
    return appointmentImage;
};

// Cập nhật ảnh tình trạng xe theo id
const updateAppointmentImage = async (id, data) => {
    try {
        const appointmentImage = await findAppointmentImageById(id);
        if (!appointmentImage) return null;

        await appointmentImage.update(data);
        return appointmentImage;
    } catch (err) {
        console.error('Lỗi khi cập nhật ảnh tình trạng xe:', err);
        throw new Error('Có lỗi xảy ra khi cập nhật ảnh tình trạng xe');
    }
};

// Xóa ảnh tình trạng xe theo id
const deleteAppointmentImageById = async (id) => {
    return await db.AppointmentImage.destroy({ where: { id } });
};

// Tìm tất cả ảnh tình trạng xe của một lịch hẹn
const findAppointmentImages = async (appointmentId) => {
    const appointmentImages = await db.AppointmentImage.findAndCountAll({
        where: { appointment_id: appointmentId }
    });
    return appointmentImages;
};

module.exports = {
    createAppointmentImage,
    findAppointmentImageById,
    updateAppointmentImage,
    deleteAppointmentImageById,
    findAppointmentImages
};