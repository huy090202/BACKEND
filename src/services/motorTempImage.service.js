const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một ảnh xe tạm mới
const createMotorTempImage = async (data) => {
    const motorTempImage = await db.MotorTempImage.create(data);
    return omit(motorTempImage.toJSON(), ['createdAt', 'updatedAt']);
}

// Tìm tất cả ảnh xe tạm
const findMotorTempImages = async (motorTempId) => {
    const motorTempImages = await db.MotorTempImage.findAndCountAll({
        where: { motorTemp_id: motorTempId }
    });
    return motorTempImages;
}

module.exports = {
    createMotorTempImage,
    findMotorTempImages
};