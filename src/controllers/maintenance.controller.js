const maintenanceService = require('../services/maintenance.service');
const userService = require('../services/user.service');
const appointmentService = require('../services/appointment.service');
const { MAINTENANCE_STATUS_CODE } = require('../utils/maintenance');
const { APPOINTMENT_STATUS_CODE } = require('../utils/appointment');
const ShortUniqueId = require('short-unique-id');

// Tạo một đơn bảo dưỡng mới
const createMaintenanceHandler = async (req, res) => {
    try {
        // user_id ở đây chính là id của KTV
        // motor_id sẽ được lấy từ id xe trong appointment
        const {
            status,
            maintenance_code,
            maintenance_date,
            notes_before,
            notes_after,
            wear_percentage_before,
            wear_percentage_after,
            user_id,
            motor_id,
            appointment_id,
        } = req.body;
        if (!user_id || !appointment_id) {
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
                message: 'Kỹ thuật viên không tồn tại',
                data: {}
            });
        }

        if (user.role !== 'Kỹ thuật viên') {
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

        const uidGenerator = new ShortUniqueId({ length: 6 });
        const maintenanceCode = uidGenerator.randomUUID();
        const existedMaintenance = await maintenanceService.findMaintenanceByMaintenanceCode(maintenanceCode);
        if (existedMaintenance) {
            return res.status(400).json({
                status: false,
                message: 'Mã đơn bảo dưỡng đã tồn tại',
                data: {}
            });
        }

        let custom_maintenance = {
            status: MAINTENANCE_STATUS_CODE['INSPECTING'],
            maintenance_code: maintenanceCode,
            maintenance_date: appointment.appointment_date,
            notes_before: notes_before,
            notes_after: notes_after,
            wear_percentage_before: wear_percentage_before,
            wear_percentage_after: wear_percentage_after,
            user_id,
            motor_id: appointment.motor_id,
            appointment_id
        };

        const newMainttenance = await maintenanceService.createMaintenance(custom_maintenance);

        if (!newMainttenance) {
            return res.status(400).json({
                status: false,
                message: 'Không thể tạo đơn bảo dưỡng',
                data: {}
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Đơn bảo dưỡng đã được tạo thành công',
            data: newMainttenance
        });
    } catch (e) {
        console.error('Lỗi khi tạo đơn bảo dưỡng:', e);
        return res.status(500).json({
            status: false,
            message: 'Không thể tạo đơn bảo dưỡng',
            data: {}
        });
    }
};

// Cập nhật đơn bảo dưỡng theo id
const updateMaintenanceByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: 'Id đơn bảo dưỡng không được để trống',
            data: {}
        });
    }

    const maintenance = await maintenanceService.findMaintenanceById(id);
    if (!maintenance) {
        return res.status(404).json({
            status: false,
            message: 'Đơn bảo dưỡng không tồn tại',
            data: {}
        });
    }

    const {
        status,
        maintenance_code,
        maintenance_date,
        notes_before,
        notes_after,
        wear_percentage_before,
        wear_percentage_after,
        user_id,
        motor_id,
        appointment_id,
    } = req.body;

    const custom_maintenance = {
        status: status || maintenance.status,
        maintenance_code: maintenance_code || maintenance.maintenance_code,
        maintenance_date: maintenance_date || maintenance.maintenance_date,
        notes_before: notes_before || maintenance.notes_before,
        notes_after: notes_after || maintenance.notes_after,
        wear_percentage_before: wear_percentage_before || maintenance.wear_percentage_before,
        wear_percentage_after: wear_percentage_after || maintenance.wear_percentage_after,
        user_id: user_id || maintenance.user_id,
        motor_id: motor_id || maintenance.motor_id,
        appointment_id: appointment_id || maintenance.appointment_id
    };

    try {
        const updatedMaintenance = await maintenanceService.updateMaintenanceById(id, custom_maintenance);

        if (!updatedMaintenance) {
            return res.status(400).json({
                status: false,
                message: 'Không thể cập nhật đơn bảo dưỡng',
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Đơn bảo dưỡng đã được cập nhật thành công',
            data: updatedMaintenance
        });
    } catch (e) {
        return res.status(500).json({
            status: false,
            message: 'Lỗi khi cập nhật đơn bảo dưỡng',
            data: {}
        });
    }
};

// Cập nhật trạng thái đơn bảo dưỡng
const changeMaintenanceStatusHandler = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
        return res.status(400).json({
            status: false,
            message: 'Id đơn bảo dưỡng không được để trống',
            data: {}
        });
    }

    if (!Object.values(MAINTENANCE_STATUS_CODE).includes(status)) {
        return res.status(400).json({
            status: false,
            message: 'Trạng thái không hợp lệ',
            data: {}
        });
    }
    try {
        let maintenance;
        if (status === MAINTENANCE_STATUS_CODE['COMPLETED']) {
            maintenance = await maintenanceService.updateMaintenanceById(id, {
                status: MAINTENANCE_STATUS_CODE['COMPLETED']
            });

            if (maintenance && maintenance.appointment_id) {
                const result = await appointmentService.changeAppointmentStatus(maintenance.appointment_id, {
                    status: APPOINTMENT_STATUS_CODE['COMPLETED']
                });
            }
        } else if (status === MAINTENANCE_STATUS_CODE['CANCEL']) {
            maintenance = await maintenanceService.updateMaintenanceById(id, {
                status: MAINTENANCE_STATUS_CODE['CANCEL']
            });

            if (maintenance && maintenance.appointment_id) {
                const result = await appointmentService.changeAppointmentStatus(maintenance.appointment_id, {
                    status: APPOINTMENT_STATUS_CODE['CANCEL']
                });
            }
        }
        else {
            maintenance = await maintenanceService.updateMaintenanceById(id, {
                status: status
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
    } catch (e) {
        return res.status(500).json({
            status: false,
            message: 'Lỗi khi cập nhật trạng thái đơn bảo dưỡng',
            data: {}
        });
    }
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
        return res.status(500).json({
            status: false,
            message: 'Không thể xoá đơn bảo dưỡng',
            data: {}
        });
    }
};

// Tìm đơn bảo dưỡng theo id
const getMaintenanceByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: 'Id đơn bảo dưỡng không được để trống',
            data: {}
        });
    }

    try {
        const maintenance = await maintenanceService.findMaintenanceById(id);
        if (!maintenance) {
            return res.status(404).json({
                status: false,
                message: 'Đơn bảo dưỡng không tồn tại',
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Lấy đơn bảo dưỡng thành công',
            data: maintenance
        });
    } catch (e) {
        return res.status(500).json({
            status: false,
            message: 'Lỗi khi lấy đơn bảo dưỡng',
            data: {}
        });
    }
};

// Tìm tất cả đơn bảo dưỡng của hệ thống
const getAllMaintenancesHandler = async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    try {
        let maintenances = [];
        maintenances = await maintenanceService.findAllMaintenances({ offset, limit: parseInt(limit) });
        return res.status(200).json({
            status: true,
            message: 'Lấy tất cả đơn bảo dưỡng thành công',
            data: maintenances.rows.map((item) => ({
                id: item.id,
                status: item.status,
                maintenance_code: item.maintenance_code,
                maintenance_date: item.maintenance_date,
                notes_before: item.notes_before,
                notes_after: item.notes_after,
                wear_percentage_before: item.wear_percentage_before,
                wear_percentage_after: item.wear_percentage_after,
                user_id: item.user_id,
                motor_id: item.motor_id,
                appointment_id: item.appointment_id,
                user: item.user,
                motor: item.motor,
                appointment: item.appointment,
                maintenanceDetails: item.maintenanceDetails
            })),
            total: maintenances.count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (e) {
        return res.status(500).json({
            status: false,
            message: 'Lỗi khi lấy tất cả đơn bảo dưỡng',
            data: {}
        });
    }
};

// Tìm tất cả đơn bảo dưỡng của kỹ thuật viên phụ trách
const getAllMaintenancesByTechHandler = async (req, res) => {
    const { id } = req.user;

    try {
        let maintenances = [];
        maintenances = await maintenanceService.findMaintenancesByTechId(id);
        return res.status(200).json({
            status: true,
            message: 'Lấy tất cả đơn bảo dưỡng của kỹ thuật viên phụ trách',
            data: maintenances.rows,
            total: maintenances.count,
        });
    } catch (e) {
        return res.status(500).json({
            status: false,
            message: 'Lỗi khi lấy tất cả đơn bảo dưỡng của kỹ thuật viên phụ trách',
            data: {}
        });
    }
}

// Tìm tất cả đơn bảo dưỡng của người dùng
// Thông qua id người dùng, lấy được danh sách các lịch hẹn của người dùng đó,
// Vì mỗi 1 lịch hẹn sẽ có 1 đơn bảo dưỡng tương ứng => có thể lấy được danh sách đơn bảo dưỡng của người dùng
const allMaintenancesHandler = async (req, res) => {
    const { id } = req.user;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    try {
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
    } catch (e) {
        return res.status(500).json({
            status: false,
            message: 'Lỗi khi lấy tất cả đơn bảo dưỡng',
            data: {}
        });
    }
};

// Lấy lịch sử bảo dưỡng của người dùng
const allMaintenancesHistoryHandler = async (req, res) => {
    const { user_id } = req.params;

    try {
        let maintenances = [];
        maintenances = await appointmentService.findMaintenanceHistoryByUserIdWithAppointment({
            id: user_id
        });
        return res.status(200).json({
            status: true,
            message: 'Lấy lịch sử bảo dưỡng của người dùng thành công',
            data: maintenances,
            total: maintenances.count,
        });
    } catch (e) {
        return res.status(500).json({
            status: false,
            message: 'Lỗi khi lấy lịch sử bảo dưỡng của người dùng',
            data: {}
        });
    }
};

module.exports = {
    createMaintenanceHandler,
    updateMaintenanceByIdHandler,
    changeMaintenanceStatusHandler,
    deleteMaintenanceByIdHandler,
    getMaintenanceByIdHandler,
    getAllMaintenancesHandler,
    getAllMaintenancesByTechHandler,
    allMaintenancesHandler,
    allMaintenancesHistoryHandler
};