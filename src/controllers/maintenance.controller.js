const maintenanceService = require('../services/maintenance.service');
const maintenanceDettailService = require('../services/maintenanceDetail.service');
const userService = require('../services/user.service');
const partService = require('../services/motorcycleparts.service');
const appointmentService = require('../services/appointment.service');
const { sequelize } = require('../models');
const { MAINTENANCE_STATUS_CODE, MAINTENANCE_STATUS_KEYS } = require('../utils/maintenance');
const { APPOINTMENT_STATUS_CODE } = require('../utils/appointment');

// Tạo một đơn bảo dưỡng mới
const createMaintenanceHandler = async (req, res) => {
    try {
        // user_id ở đây chính là id của KTV
        // motor_id sẽ được lấy từ id xe trong appointment
        const {
            status,
            maintenance_date,
            notes_before,
            notes_after,
            wear_percentage_before,
            wear_percentage_after,
            user_id,
            motor_id,
            appointment_id,
            details
        } = req.body;
        if (!notes_before || !notes_after || !wear_percentage_before || !wear_percentage_after || !user_id || !appointment_id || !details) {
            return res.status(400).json({
                status: false,
                message: 'Các trường bắt buộc không được để trống',
                data: {}
            });
        }

        const user = await userService.getUserProfile(user_id);
        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'Người dùng không tồn tại',
                data: {}
            });
        }

        if (user.role !== 'TECH') {
            return res.status(400).json({
                status: false,
                message: 'Người dùng không phải KTV',
                data: {}
            });
        }

        const appointment = await appointmentService.findAppointmentById(appointment_id);
        if (!appointment) {
            return res.status(400).json({
                status: false,
                message: 'Lịch hẹn không tồn tại',
                data: {}
            });
        }

        let custom_maintenance = {
            status: MAINTENANCE_STATUS_CODE['RECEIVING'],
            maintenance_date,
            notes_before: notes_before,
            notes_after: notes_after,
            wear_percentage_before: wear_percentage_before,
            wear_percentage_after: wear_percentage_after,
            user_id,
            motor_id: appointment.motor_id,
            appointment_id
        };

        const t = await sequelize.transaction();

        try {
            const newMainttenance = await maintenanceService.createMaintenance(custom_maintenance, { transaction: t });
            if (!newMainttenance) {
                await t.rollback();
                return res.status(400).json({
                    status: false,
                    message: 'Không thể tạo đơn bảo dưỡng',
                    data: {}
                });
            }

            if (details && Array.isArray(details)) {
                for (let item of details) {
                    const { quantity, price, wear_percentage, part_id } = item;
                    if (!quantity || !price || !wear_percentage || !part_id) {
                        await t.rollback();
                        return res.status(400).json({
                            status: false,
                            message: 'Các trường bắt buộc để tạo chi tiết không được để trống',
                            data: {}
                        });
                    }

                    const existedPart = await partService.findMotorcyclepartsById(part_id);
                    if (!existedPart) {
                        await t.rollback();
                        return res.status(400).json({
                            status: false,
                            message: 'Linh kiện không tồn tại',
                            data: {}
                        });
                    }

                    if (price < 0) {
                        await t.rollback();
                        return res.status(400).json({
                            status: false,
                            message: 'Giá linh kiện không hợp lệ',
                            data: {}
                        });
                    }

                    if (quantity <= 0) {
                        await t.rollback();
                        return res.status(400).json({
                                status: false,
                                message: 'Số lượng linh kiện không hợp lệ',
                                data: {}
                            }
                        );
                    }

                    if (wear_percentage < 0 || wear_percentage > 100) {
                        await t.rollback();
                        return res.status(400).json({
                            status: false,
                            message: 'Phần trăm mòn không hợp lệ',
                            data: {}
                        });
                    }

                    await maintenanceDettailService.createMaintenanceDetail({
                        quantity,
                        price,
                        wear_percentage,
                        maintenance_id: newMainttenance.id,
                        part_id
                    }, { transaction: t });
                }
            }

            await t.commit();

            return res.status(201).json({
                status: true,
                message: 'Đơn bảo dưỡng đã được tạo thành công',
                data: {
                    ...newMainttenance,
                    ...(details && {
                        detail: details.map((item) => ({
                            quantity: item.quantity,
                            price: item.price,
                            wear_percentage: item.wear_percentage,
                            part_id: item.part_id
                        }))
                    })
                }
            });
        } catch (e) {
            console.error('Lỗi khi tạo đơn bảo dưỡng:', e);
            await t.rollback();
            return res.status(400).json({
                status: false,
                message: 'Không thể tạo đơn bảo dưỡng',
                data: {}
            });
        }
    } catch (e) {
        console.error('Lỗi khi tạo đơn bảo dưỡng:', e);
        await t.rollback();
        return res.status(400).json({
            status: false,
            message: 'Không thể tạo đơn bảo dưỡng',
            data: {}
        });
    }
};

// Cập nhật đơn bảo dưỡng theo id
const updateMaintenanceByIdHandler = async (req, res) => {
};

// Cập nhật trạng thái đơn bảo dưỡng
const changeMaintenanceStatusHandler = async (req, res) => {
    const { id } = req.params;
    const { status } = req.query;

    if (!id) {
        return res.status(400).json({
            status: false,
            message: 'Id đơn bảo dưỡng không được để trống',
            data: {}
        });
    }

    if (!MAINTENANCE_STATUS_KEYS.includes(status.toUpperCase())) {
        return res.status(400).json({
            status: false,
            message: 'Trạng thái không hợp lệ',
            data: {}
        });
    }
    let maintenance;
    if (status.toUpperCase() === MAINTENANCE_STATUS_CODE['COMPLETED']) {
        maintenance = await maintenanceService.updateMaintenanceById(id, {
            status: MAINTENANCE_STATUS_CODE['COMPLETED']
        });

        if (maintenance && maintenance.appointment_id) {
            const result = await appointmentService.changeAppointmentStatus(maintenance.appointment_id, {
                status: APPOINTMENT_STATUS_CODE['COMPLETED']
            });
            console.log('Cập nhật appointment:', result);
        }
    } else {
        maintenance = await maintenanceService.updateMaintenanceById(id, {
            status: status.toUpperCase()
        });
    }

    if (!maintenance) {
        return res.status(404).json({
            status: false,
            message: 'Đơn bảo dưỡng không tồn tại',
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: `Trạng thái đơn bảo dưỡng đã được ${status}`,
        data: maintenance
    });
};

// Xóa đơn bảo dưỡng theo id
const deleteMaintenanceByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: 'Id đơn bảo dưỡng không được để trống'
        });
    }

    try {
        await maintenanceService.deleteMaintenanceById(id);
        return res.status(200).json({
            status: true,
            message: 'Đơn bảo dưỡng đã được xoá thành công',
            data: {}
        });
    } catch (e) {
        console.error('Lỗi khi xoá đơn bảo dưỡng:', e);
        return res.status(400).json({
            status: false,
            message: 'Không thể xoá đơn bảo dưỡng',
            data: {}
        });
    }
};

// Tìm đơn bảo dưỡng theo id
const getMaintenanceByIdHandler = async (req, res) => {
};

// Tìm tất cả đơn bảo dưỡng của hệ thống
const getAllMaintenancesHandler = async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let maintenances = [];
    maintenances = await maintenanceService.findAllMaintenances({ offset, limit: parseInt(limit) });
    return res.status(200).json({
        status: true,
        message: 'Lấy tất cả đơn bảo dưỡng thành công',
        data: maintenances.rows.map((item) => ({
            id: item.id,
            status: item.status,
            maintenance_date: item.maintenance_date,
            notes_before: item.notes_before,
            notes_after: item.notes_after,
            wear_percentage_before: item.wear_percentage_before,
            wear_percentage_after: item.wear_percentage_after,
            user_id: item.user_id,
            motor_id: item.motor_id,
            appointment_id: item.appointment_id,
            details: item.maintenanceDetails.map((detail) => ({
                id: detail.id,
                quantity: detail.quantity,
                price: detail.price,
                wear_percentage: detail.wear_percentage,
                part_id: detail.part_id
            }))
        })),
        total: maintenances.count,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Tìm tất cả đơn bảo dưỡng của người dùng
// Thông qua id người dùng, lấy được danh sách các lịch hẹn của người dùng đó,
// Vì mỗi 1 lịch hẹn sẽ có 1 đơn bảo dưỡng tương ứng => có thể lấy được danh sách đơn bảo dưỡng của người dùng
const allMaintenancesHandler = async (req, res) => {
    const { id } = req.user;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let maintenances = [];
    maintenances = await appointmentService.findMaintenancesByUserIdWithAppointment({
        id,
        offset,
        limit: parseInt(limit)
    });
    return res.status(200).json({
        status: true,
        message: 'Lấy tất cả đơn bảo dưỡng thành công',
        data: maintenances,
        total: maintenances.count,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

module.exports = {
    createMaintenanceHandler,
    updateMaintenanceByIdHandler,
    changeMaintenanceStatusHandler,
    deleteMaintenanceByIdHandler,
    getMaintenanceByIdHandler,
    getAllMaintenancesHandler,
    allMaintenancesHandler
};