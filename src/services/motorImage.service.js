const { omit } = require('lodash');
const db = require('../models/index');

// Create motor image
const createMotorImage = async (data) => {
    const motorImage = await db.MotorImage.create(data);
    return omit(motorImage.toJSON(), ['createdAt', 'updatedAt']);
};

// Find motor image by id
const findMotorImageById = async (id) => {
    const motorImage = await db.MotorImage.findOne({ where: { id } });
    return motorImage;
};

// Update motor image by id
const updateMotorImage = async (id, data) => {
    try {
        const motorImage = await findMotorImageById(id);
        if (!motorImage) return null;

        await motorImage.update(data);
        return motorImage;
    } catch (e) {
        console.error('Error updating motor image:', e);
        throw new Error('Failed to update motor image');
    }
};

// Delete motor image by id
const deleteMotorImageById = async (id) => {
    return await db.MotorImage.destroy({ where: { id } });
};

// Get all motor images
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