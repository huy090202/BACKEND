const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một ảnh xe mới
const createMotorImage = async (data) => {
    const motorImage = await db.MotorImage.create(data);
    return omit(motorImage.toJSON(), ['createdAt', 'updatedAt']);
};

// Tìm một ảnh xe theo id
const findMotorImageById = async (id) => {
    const motorImage = await db.MotorImage.findOne({ where: { id } });
    return motorImage;
};

// Cập nhật ảnh xe theo id
const updateMotorImage = async (id, data) => {
    try {
        const motorImage = await findMotorImageById(id);
        if (!motorImage) return null;

        await motorImage.update(data);
        return motorImage;
    } catch (e) {
        console.error('Lỗi khi cập nhật ảnh xe:', e);
        throw new Error('Có lỗi xảy ra khi cập nhật ảnh xe');
    }
};

// Xóa ảnh xe theo id
const deleteMotorImageById = async (id) => {
    return await db.MotorImage.destroy({ where: { id } });
};

// Tìm tất cả ảnh xe của một xe
const findMotorImages = async (motorId) => {
    const motorImages = await db.MotorImage.findAndCountAll({
        where: { motor_id: motorId }
    });
    return motorImages;
}

module.exports = {
    createMotorImage,
    updateMotorImage,
    findMotorImageById,
    deleteMotorImageById,
    findMotorImages
};