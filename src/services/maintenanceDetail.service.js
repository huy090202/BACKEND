const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một chi tiết bảo dưỡng mới   
const createMaintenanceDetail = async (data) => {
    const maintenanceDetail = await db.MaintenanceDetail.create(data);
    return omit(maintenanceDetail.toJSON(), ['createdAt', 'updatedAt']);
}

// Tìm một chi tiết bảo dưỡng theo id
const findMaintenanceDetailById = async (id) => {
    const maintenanceDetail = await db.MaintenanceDetail.findByPk(id);
    return maintenanceDetail;
};

// Cập nhật chi tiết bảo dưỡng theo id
const updateMaintenanceDetailById = async (id, data) => {
    try {
        const maintenanceDetail = await findMaintenanceDetailById(id);
        if (!maintenanceDetail) return null;

        await maintenanceDetail.update(data);
        return maintenanceDetail;
    } catch (e) {
        console.error('Lỗi khi cập nhật chi tiết bảo dưỡng:', e);
        throw new Error('Không thể cập nhật chi tiết bảo dưỡng');
    }
};

// Xóa chi tiết bảo dưỡng theo id
const deleteMaintenanceDetailById = async (id) => {
    return await db.MaintenanceDetail.destroy({ where: { id } });
};

// Tìm tất cả chi tiết bảo dưỡng của 1 đơn bảo dưỡng
const findMaintenanceDetails = async ({ maintenanceId, offset, limit }) => {
    const maintenanceDetails = await db.MaintenanceDetail.findAndCountAll({
        where: maintenanceId,
        offset,
        limit
    });
    return maintenanceDetails;
};

module.exports = {
    createMaintenanceDetail,
    findMaintenanceDetailById,
    updateMaintenanceDetailById,
    deleteMaintenanceDetailById,
    findMaintenanceDetails
}