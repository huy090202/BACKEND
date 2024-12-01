const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một nhà sản xuất mới
const createManufacturer = async (data) => {
    const manufacturer = await db.Manufacturer.create(data);
    return omit(manufacturer.toJSON(), ['createdAt', 'updatedAt']);
};

// Tìm một nhà sản xuất theo tên
const findManufacturerByName = async (name) => {
    const manufacturer = await db.Manufacturer.findOne({ where: { name } });
    return manufacturer;
};

// Tìm tất cả nhà sản xuất
const findManufacturers = async ({ status, offset, limit }) => {
    const manufacturers = await db.Manufacturer.findAll({
        where: status,
        offset,
        limit,
        order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
    });

    const totalManufacturers = await db.Manufacturer.count();
    return {
        rows: manufacturers,
        count: totalManufacturers
    }
};

// Cập nhật trạng thái nhà sản xuất
const updateManufacturer = async (id, status) => {
    return await db.Manufacturer.update({ active: status }, { where: { id } });
};

// Xóa nhà sản xuất theo id
const deleteManufacturerById = async (id) => {
    return await db.Manufacturer.destroy({ where: { id } });
};

// Tìm một nhà sản xuất theo id
const findManufacturerById = async (id) => {
    const manufacturer = await db.Manufacturer.findByPk(id);
    return manufacturer;
};

// Cập nhật thông tin nhà sản xuất theo id
const updateManufacturerById = async (id, data) => {
    try {
        const manufacturer = await findManufacturerById(id);
        if (!manufacturer) return null;

        await manufacturer.update(data);
        return manufacturer;
    } catch (e) {
        console.error('Lỗi trong việc cập nhật nhà sản xuất:', e);
        throw new Error('Có lỗi xảy ra khi cập nhật nhà sản xuất');
    }
};

module.exports = {
    createManufacturer,
    findManufacturerByName,
    findManufacturerById,
    updateManufacturerById,
    updateManufacturer,
    deleteManufacturerById,
    findManufacturers
};