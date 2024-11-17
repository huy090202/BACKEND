const maintenanceDetailService = require('../services/maintenanceDetail.service');
const maintenanceService = require('../services/maintenance.service');
const partService = require('../services/motorcycleparts.service');

// Tạo một chi tiết bảo dưỡng mới
const createMaintenanceDetailHandler = async (req, res) => {
    try {
        const { quantity, price, wear_percentage, maintenance_id, part_id } = req.body;
        console.log('req.body:', req.body);
        if (!quantity || !price || !wear_percentage || !maintenance_id || !part_id) {
            return res.status(400).json({
                status: false,
                message: 'Vui lòng nhập đầy đủ thông tin chi tiết bảo dưỡng',
                data: {}
            });
        }

        const existedMaintenance = await maintenanceService.findMaintenanceById(maintenance_id);
        if (!existedMaintenance) {
            return res.status(404).json({
                status: false,
                message: 'Không tìm thấy đơn bảo dưỡng',
                data: {}
            });
        }

        const existedPart = await partService.findMotorcyclepartsById(part_id);
        if (!existedPart) {
            return res.status(404).json({
                status: false,
                message: 'Không tìm thấy linh kiện xe máy',
                data: {}
            });
        }

        if (quantity <= 0 || price <= 0 || wear_percentage < 0) {
            return res.status(400).json({
                status: false,
                message: 'Số lượng, giá và phần trăm mòn phải lớn hơn 0',
                data: {}
            });
        }

        const data = {
            quantity,
            price,
            wear_percentage,
            maintenance_id,
            part_id
        };

        const maintenanceDetail = await maintenanceDetailService.createMaintenanceDetail(data);
        if (!maintenanceDetail) {
            return res.status(400).json({
                status: false,
                message: 'Không thể tạo chi tiết cho đơn bảo dưỡng',
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Tạo chi tiết bảo dưỡng thành công',
            data: maintenanceDetail
        });
    } catch (error) {
        console.error('Lỗi khi tạo chi tiết bảo dưỡng:', error);
        return res.status(500).json({
            status: false,
            message: 'Lỗi khi tạo chi tiết bảo dưỡng',
            data: {}
        });
    }
};

// Cập nhật chi tiết bảo dưỡng theo id
const updateMaintenanceDetailByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: 'Id chi tiết bảo dưỡng không được để trống',
            data: {}
        });
    }

    const existedMaintenanceDetail = await maintenanceDetailService.findMaintenanceDetailById(id);
    if (!existedMaintenanceDetail) {
        return res.status(404).json({
            status: false,
            message: 'Chi tiết bảo dưỡng không tồn tại',
            data: {}
        });
    }

    const { quantity, price, wear_percentage, maintenance_id, part_id } = req.body;
    if (!quantity || !price || !wear_percentage || !maintenance_id || !part_id) {
        return res.status(400).json({
            status: false,
            message: 'Vui lòng nhập đầy đủ thông tin chi tiết bảo dưỡng',
            data: {}
        });
    }

    if (quantity <= 0 || price <= 0 || wear_percentage < 0) {
        return res.status(400).json({
            status: false,
            message: 'Số lượng, giá và phần trăm mòn phải lớn hơn 0',
            data: {}
        });
    }

    const data = {
        quantity,
        price,
        wear_percentage,
        maintenance_id,
        part_id
    };

    const maintenanceDetail = await maintenanceDetailService.updateMaintenanceDetailById(id, data);
    if (!maintenanceDetail) {
        return res.status(400).json({
            status: false,
            message: 'Không thể cập nhật chi tiết bảo d룡ng',
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: 'Cập nhật chi tiết bảo dưỡng thành công',
        data: maintenanceDetail
    });
};

// Xóa chi tiết bảo dưỡng theo id
const deleteMaintenanceDetailByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: 'Id chi tiết bảo dưỡng không được để trống',
            data: {}
        });
    }

    try {
        await maintenanceDetailService.deleteMaintenanceDetailById(id);
        return res.status(200).json({
            status: true,
            message: 'Xóa chi tiết bảo dưỡng thành công',
            data: {}
        });
    } catch (error) {
        console.error('Lỗi khi xóa chi tiết bảo dưỡng:', error);
        return res.status(500).json({
            status: false,
            message: 'Lỗi khi xóa chi tiết bảo dưỡng',
            data: {}
        });
    }
};

// Lấy chi tiết bảo dưỡng theo id
const getMaintenanceDetailByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: 'Id chi tiết bảo dưỡng không được để trống',
            data: {}
        });
    }

    const maintenanceDetail = await maintenanceDetailService.findMaintenanceDetailById(id);
    if (!maintenanceDetail) {
        return res.status(404).json({
            status: false,
            message: 'Chi tiết bảo dưỡng không tồn tại',
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: 'Lấy chi tiết bảo dưỡng thành công',
        data: maintenanceDetail
    });
};

// Lấy tất cả chi tiết bảo dưỡng của 1 đơn bảo dưỡng
const getAllMaintenanceDetailsHandler = async (req, res) => {
    const { maintenance_id, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let maintenanceDetails = [];
    maintenanceDetails = await maintenanceDetailService.findMaintenanceDetails({ maintenance_id, offset, limit });

    return res.status(200).json({
        status: true,
        message: 'Lấy tất cả chi tiết bảo dưỡng của 1 đơn bảo dưỡng thành công',
        data: maintenanceDetails.rows,
        total: maintenanceDetails.count,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

module.exports = {
    createMaintenanceDetailHandler,
    updateMaintenanceDetailByIdHandler,
    deleteMaintenanceDetailByIdHandler,
    getMaintenanceDetailByIdHandler,
    getAllMaintenanceDetailsHandler
};