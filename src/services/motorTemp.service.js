const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một xe tạm mới
const createMotorTemp = async (data) => {
    const motorTemp = await db.MotorTemp.create(data);
    return omit(motorTemp.toJSON(), ['createdAt', 'updatedAt']);
};

// Tìm một xe tạm theo biển số
const findMotorTempByLicensePlate = async (license_plate) => {
    const motorTemp = await db.MotorTemp.findOne({ where: { license_plate } });
    return motorTemp;
};

// Tìm một xe tạm theo số máy
const findMotorTempByEngineNumber = async (engine_number) => {
    const motorTemp = await db.MotorTemp.findOne({ where: { engine_number } });
    return motorTemp
};

// Tìm một xe tạm theo số khung
const findMotorTempByChassisNumber = async (chassis_number) => {
    const motorTemp = await db.MotorTemp.findOne({ where: { chassis_number } });
    return motorTemp;
};

// Tìm một xe tạm theo id
const findMotorTempById = async (id) => {
    const motorTemp = await db.MotorTemp.findByPk(id)
    return motorTemp;
};

// Cập nhật xe tạm theo id
const updateMotorTempById = async (id, data) => {
    try {
        const motorTemp = await findMotorTempById(id);
        if (!motorTemp) return null;

        await motorTemp.update(data);
        return motorTemp;
    } catch (e) {
        console.error('Có lỗi xảy ra khi cập nhật xe tạm:', e);
        throw new Error('Cập nhật xe tạm thất bại');
    }
};

// Xóa xe tạm theo id
const deleteMotorTempById = async (id) => {
    return await db.MotorTemp.destroy({ where: { id } });
};

// Tìm tất cả xe tạm
const findMotorTemps = async () => {
    const motorTemps = await db.MotorTemp.findAndCountAll({});
    return motorTemps;
};

module.exports = {
    createMotorTemp,
    findMotorTempByLicensePlate,
    findMotorTempByEngineNumber,
    findMotorTempByChassisNumber,
    findMotorTempById,
    updateMotorTempById,
    deleteMotorTempById,
    findMotorTemps
};