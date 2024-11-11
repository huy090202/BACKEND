const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một xe mới
const createMotor = async (data) => {
    const motor = await db.Motor.create(data);
    return omit(motor.toJSON(), ['createdAt', 'updatedAt']);
}

// Tìm một xe theo biển số
const findMotorByLicensePlate = async (license_plate) => {
    const motor = await db.Motor.findOne({ where: { license_plate } });
    return motor;
};

// Tìm một xe theo số máy
const findMotorByEngineNumber = async (engine_number) => {
    const motor = await db.Motor.findOne({ where: { engine_number } });
    return motor
};

// Tìm một xe theo số khung
const findMotorByChassisNumber = async (chassis_number) => {
    const motor = await db.Motor.findOne({ where: { chassis_number } });
    return motor;
};

// Tìm một xe theo id
const findMotorById = async (id) => {
    const motor = await db.Motor.findByPk(id)
    return motor;
};

// Cập nhật xe theo id
const updateMotorById = async (id, data) => {
    try {
        const motor = await findMotorById(id);
        if (!motor) return null;

        await motor.update(data);
        return motor;
    } catch (e) {
        console.error('Có lỗi xảy ra khi cập nhật xe:', e);
        throw new Error('Cập nhật xe thất bại');
    }
};

// Xóa xe theo id
const deleteMotorById = async (id) => {
    return await db.Motor.destroy({ where: { id } });
};

// Tìm tất cả xe của người dùng
const findMotors = async ({ userId, offset, limit }) => {
    const motors = await db.Motor.findAndCountAll({
        where: userId,
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