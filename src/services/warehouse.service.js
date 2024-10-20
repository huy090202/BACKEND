const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một kho mới
const createWarehouse = async (data) => {
    const warehouse = await db.Warehouse.create(data);
    return omit(warehouse.toJSON(), ['createdAt', 'updatedAt']);
};

// Cập nhật kho theo id
const updateWarehouseById = async (id, data) => {
    try {
        const warehouse = await findWarehouseById(id);
        if (!warehouse) return null;

        await warehouse.update(data);
        return warehouse;
    } catch (e) {
        console.error('Lỗi trong việc cập nhật kho:', e);
        throw new Error('Có lỗi xảy ra khi cập nhật kho');
    }
};

// Cập nhật trạng thái kho
const updateWarehouse = async (id, status) => {
    return await db.Warehouse.update({ active: status }, { where: { id } });
};

// Xóa kho theo id
const deleteWarehouseById = async (id) => {
    return await db.Warehouse.destroy({ where: { id } });
};

// Tìm một kho theo id
const findWarehouseById = async (id) => {
    const warehouse = await db.Warehouse.findByPk(id)
    return warehouse;
};

// Tìm tất cả kho theo name
const findWarehouseByName = async (name) => {
    const warehouse = await db.Warehouse.findOne({ where: { name } });
    return warehouse;
};

// Tìm tất cả kho
const findWarehouses = async ({ status, offset, limit }) => {
    const warehouses = await db.Warehouse.findAndCountAll({
        where: status,
        offset,
        limit
    });
    return warehouses;
};

module.exports = {
    createWarehouse,
    findWarehouseByName,
    findWarehouses,
    updateWarehouse,
    findWarehouseById,
    deleteWarehouseById,
    updateWarehouseById
};