const { omit } = require('lodash');
const db = require('../models/index');

// Tạo một đơn bảo dưỡng mới
const createMaintenance = async (data) => {
    const maintenance = await db.Maintenance.create(data);
    return omit(maintenance.toJSON(), ['createdAt', 'updatedAt']);
};

// Tìm một đơn bảo dưỡng theo mã đơn
const findMaintenanceByMaintenanceCode = async (maintenanceCode) => {
    const maintenance = await db.Maintenance.findOne({
        where: { maintenance_code: maintenanceCode }
    });
    return maintenance;
};

// Tìm một đơn bảo dưỡng theo id
const findMaintenanceById = async (id) => {
    const maintenance = await db.Maintenance.findByPk(id, {
        include: [
            {
                model: db.User,
                as: 'user'
            },
            {
                model: db.Motor,
                as: 'motor',
                include: [
                    {
                        model: db.MotorImage,
                        as: 'motorImages',
                        attributes: ['id', 'image_url']
                    }
                ]
            },
            {
                model: db.MaintenanceDetail,
                as: 'maintenanceDetails',
                include: [
                    {
                        model: db.MotorcycleParts,
                        as: 'part'
                    }
                ]
            },
            {
                model: db.Appointment,
                as: 'appointment',
                include: [
                    {
                        model: db.User,
                        as: 'user',
                        attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber']
                    }
                ]
            },
            {
                model: db.Invoice,
                as: 'invoice'
            }
        ]
    });
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
        limit,
        order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
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
                model: db.User,
                as: 'user'
            },
            {
                model: db.Motor,
                as: 'motor',
                include: [
                    {
                        model: db.MotorImage,
                        as: 'motorImages',
                        attributes: ['id', 'image_url']
                    }
                ]
            },
            {
                model: db.MaintenanceDetail,
                as: 'maintenanceDetails',
                include: [
                    {
                        model: db.MotorcycleParts,
                        as: 'part'
                    }
                ]
            },
            {
                model: db.Appointment,
                as: 'appointment',
                include: [
                    {
                        model: db.User,
                        as: 'user',
                        attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber']
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
    });

    const totalMaintenances = await db.Maintenance.count();
    return {
        rows: maintenances,
        count: totalMaintenances
    }
};

// Tìm tất cả đơn bảo dưỡng của kỹ thuật viên
const findMaintenancesByTechId = async (id) => {
    const maintenances = await db.Maintenance.findAndCountAll({
        where: { user_id: id },
        include: [
            {
                model: db.Motor,
                as: 'motor'
            },
            {
                model: db.MaintenanceDetail,
                as: 'maintenanceDetails',
                include: [
                    {
                        model: db.MotorcycleParts,
                        as: 'part'
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
    });
    return maintenances;
};

// Câp nhật trạng thái đơn bảo dưỡng
const changeMaintenanceStatus = async (id, status) => {
    return await db.Maintenance.update(status, { where: { id } });
};

module.exports = {
    createMaintenance,
    findMaintenanceByMaintenanceCode,
    findMaintenanceById,
    updateMaintenanceById,
    deleteMaintenanceById,
    findMaintenances,
    findAllMaintenances,
    findMaintenancesByTechId,
    changeMaintenanceStatus,
};