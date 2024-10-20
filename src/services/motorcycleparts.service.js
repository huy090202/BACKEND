const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một phụ tùng mới
const createMotorcycleparts = async (data) => {
    const motorcycleparts = await db.MotorcycleParts.create(data);
    return omit(motorcycleparts.toJSON(), ['createdAt', 'updatedAt']);
};

// Cập nhật phụ tùng theo id
const updateMotorcycleparts = async (id, data) => {
    try {
        const motorcycleparts = await findMotorcyclepartsById(id);
        if (!motorcycleparts) return null;

        await motorcycleparts.update(data);
        return motorcycleparts;
    } catch (e) {
        console.error('Lỗi trong việc cập nhật phụ tùng:', e);
        throw new Error('Có lỗi xảy ra khi cập nhật phụ tùng');
    }
};

// Cập nhật trạng thái phụ tùng
const updateMotorcyclepartsById = async (id, status) => {
    return await db.MotorcycleParts.update({ active: status }, { where: { id } });
};

// Xóa phụ tùng theo id
const deleteMotorcyclepartsById = async (id) => {
    return await db.MotorcycleParts.destroy({ where: { id } });
};

// Tìm một phụ tùng theo id
const findMotorcyclepartsById = async (id) => {
    const motorcycleparts = await db.MotorcycleParts.findByPk(id)
    return motorcycleparts;
};

// Tìm tất cả phụ tùng
const findMotorcycleparts = async ({ status, offset, limit }) => {
    const motorcycleparts = await db.MotorcycleParts.findAndCountAll({
        where: status,
        offset,
        limit
    });
    return motorcycleparts;
};

// Tìm một phụ tùng theo tên
const findMotorcyclepartsByName = async (name) => {
    const motorcycleparts = await db.MotorcycleParts.findOne({ where: { part_name: name } });
    return motorcycleparts;
};

module.exports = {
    createMotorcycleparts,
    updateMotorcycleparts,
    updateMotorcyclepartsById,
    deleteMotorcyclepartsById,
    findMotorcyclepartsByName,
    findMotorcycleparts,
    findMotorcyclepartsById
};