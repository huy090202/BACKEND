const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một số lượng linh kiện xe máy mới
const createStock = async (data) => {
    const stock = await db.Stock.create(data);
    return omit(stock.toJSON(), ['createdAt', 'updatedAt']);
};

// Cập nhật số lượng linh kiện xe máy 
const updateStock = async (data) => {
    const { quantity, warehouse_id, part_id } = data;

    try {
        const stock = await db.Stock.update(
            { quantity },
            {
                where: {
                    warehouse_id: warehouse_id,
                    part_id: part_id,
                },
                returning: true
            }
        );

        return stock;
    } catch (e) {
        console.error('Lỗi khi cập nhật số lượng linh kiện xe máy:', e);
        throw new Error('Có lỗi xảy ra khi cập nhật số lượng linh kiện xe máy');
    }
};

// Xóa số lượng linh kiện xe máy theo id linh kiện
const deleteStockById = async (id) => {
    return await db.Stock.destroy({ where: { part_id: id } });
};

// Tìm số lượng linh kiện xe máy theo id linh kiện
const findStockById = async (id) => {
    const stock = await db.Stock.findOne({
        where: { part_id: id },
        attributes: ['quantity', 'warehouse_id'],
        include: [
            {
                model: db.Warehouse,
                as: 'warehouse',
                attributes: ['name', 'address']
            }
        ]
    });
    return stock;
};

module.exports = {
    createStock,
    updateStock,
    deleteStockById,
    findStockById
};