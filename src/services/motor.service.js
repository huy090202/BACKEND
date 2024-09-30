const { omit } = require('lodash');
const db = require('../models/index');

// Create Motor
const createMotor = async (data) => {
    const motor = await db.Motor.create(data);
    return omit(motor.toJSON(), ['createdAt', 'updatedAt']);
}

// Find Motor By License Plate
const findMotorByLicensePlate = async (license_plate) => {
    const motor = await db.Motor.findOne({ where: { license_plate } });
    return motor;
};

// Find Motor By Engine Number
const findMotorByEngineNumber = async (engine_number) => {
    const motor = await db.Motor.findOne({ where: { engine_number } });
    return motor
};

// Find Motor By Chassis Number
const findMotorByChassisNumber = async (chassis_number) => {
    const motor = await db.Motor.findOne({ where: { chassis_number } });
    return motor;
};

// Find Motor By Id
const findMotorById = async (id) => {
    const motor = await db.Motor.findOne({ where: { id } });
    return motor;
};

// Update Motor By Id
const updateMotorById = async (id, data) => {
    try {
        const motor = await findMotorById(id);
        if (!motor) return null;

        await motor.update(data);
        return motor;
    } catch (e) {
        console.error('Error updating motor:', e);
        throw new Error('Failed to update motor');
    }
};

// Delete Motor By Id
const deleteMotorById = async (id) => {
    return await db.Motor.destroy({ where: { id } });
};

// Get All Motors
const findMotors = async ({ offset, limit }) => {
    const motors = await db.Motor.findAndCountAll({
        offset,
        limit
    });
    return motors;
};

module.exports = {
    createMotor,
    findMotorByLicensePlate,
    findMotorByEngineNumber,
    findMotorByChassisNumber,
    findMotorById,
    updateMotorById,
    deleteMotorById,
    findMotors
};