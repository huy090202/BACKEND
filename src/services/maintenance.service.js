const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một đơn bảo dưỡng mới
const createMaintenance = async (data) => {
    const maintenance = await db.Maintenance.create(data);
    return omit(maintenance.toJSON(), ['createdAt', 'updatedAt']);
};

// Tìm một đơn bảo dưỡng theo id
const findMaintenanceById = async (id) => {
    const maintenance = await db.Maintenance.findByPk(id);
    return maintenance;
};

// Cập nhật đơn bảo dưỡng theo id
const updateMaintenanceById = async (id, data) => {
    try {
        const maintenance = await findMaintenanceById(id);
        if (!maintenance) return null;

        await maintenance.update(data);
        return maintenance;
    } catch (e) {
        console.error('Lỗi khi cập nhật thông tin bảo dưỡng:', e);
        throw new Error('Không thể cập nhật thông tin bảo dưỡng');
    }
};

// Xóa đơn bảo dưỡng theo id
const deleteMaintenanceById = async (id) => {
    return await db.Maintenance.destroy({ where: { id } });
};

// Tìm tất cả đơn bảo dưỡng của người dùng
const findMaintenances = async ({ userId, offset, limit }) => {
    const maintenances = await db.Maintenance.findAndCountAll({
        where: userId,
        offset,
        limit
    });
    return maintenances;
};

// Tìm tất cả đơn bảo dưỡng của hệ thống
const findAllMaintenances = async ({ offset, limit }) => {
    const maintenances = await db.Maintenance.findAll({
        offset,
        limit,
        include: [
            {
                // Lấy thông tin chi tiết bảo dưỡng thông qua associated với đơn bảo dưỡng
                model: db.MaintenanceDetail,
                as: 'maintenanceDetails',
                include: [
                    {
                        // Lấy thông tin phụ tùng thông qua associated với chi tiết bảo dưỡng
                        model: db.MotorcycleParts,
                        as: 'part',
                        attributes: ['id', 'part_name', 'part_price', 'average_life', 'description', 'part_image', 'manufacturer_id', 'category_id']
                    }
                ],
                attributes: ['id', 'quantity', 'price', 'wear_percentage', 'part_id']
            }
        ]
    });

    const totalMaintenances = await db.Maintenance.count();
    return {
        rows: maintenances,
        count: totalMaintenances
    }
};

// Câp nhật trạng thái đơn bảo dưỡng
const changeMaintenanceStatus = async (id, status) => {
    return await db.Maintenance.update(status, { where: { id } });
};

module.exports = {
    createMaintenance,
    findMaintenanceById,
    updateMaintenanceById,
    deleteMaintenanceById,
    findMaintenances,
    findAllMaintenances,
    changeMaintenanceStatus,
};