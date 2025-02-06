const warehouseService = require('../services/warehouse.service');

// Tạo một kho mới
const createWarehouseHandler = async (req, res) => {
    const { name, address, active } = req.body;
    if (!name) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        })
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Trạng thái phải là true hoặc false",
        })
    }

    const existedWarehouse = await warehouseService.findWarehouseByName(name);
    if (existedWarehouse) {
        return res.status(400).json({
            status: false,
            message: "Kho đã tồn tại",
            data: {}
        })
    }

    try {
        const warehouse = await warehouseService.createWarehouse(req.body);
        if (!warehouse) {
            return res.status(500).json({
                status: false,
                message: "Có lỗi xảy ra khi tạo kho",
                data: {}
            })
        }

        return res.status(201).json({
            status: true,
            message: "Kho đã được tạo thành công",
            data: warehouse
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi tạo kho",
            data: {}
        })
    }
};

// Cập nhật kho theo id
const updateWarehouseByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id kho không được để trống",
            data: {}
        })
    }

    const existedWarehouse = await warehouseService.findWarehouseById(id);
    if (!existedWarehouse) {
        return res.status(404).json({
            status: false,
            message: `Kho '${id}' không tồn tại`,
            data: {}
        })
    }

    const { name, address, active } = req.body;
    if (!name) {
        return res.status(400).json({
            status: false,
            message: "Tên kho không được để trống",
            data: {}
        })
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Trạng thái phải là true hoặc false",
        })
    }

    try {
        const warehouse = await warehouseService.updateWarehouseById(id, req.body);
        if (!warehouse) {
            return res.status(500).json({
                status: false,
                message: "Có lỗi xảy ra khi cập nhật kho",
                data: {}
            })
        }

        return res.status(200).json({
            status: true,
            message: "Kho đã được cập nhật thành công",
            data: warehouse
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi cập nhật kho",
            data: {}
        })
    }
};

// Cập nhật trạng thái kho
const changeWarehouseStatusHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id kho không được để trống",
            data: {}
        })
    }

    const existedWarehouse = await warehouseService.findWarehouseById(id);
    if (!existedWarehouse) {
        return res.status(404).json({
            status: false,
            message: `Kho '${id}' không tồn tại`,
            data: {}
        })
    }

    try {
        const { active } = req.body;
        let activeVar = true;
        if (active === 'false' || active === false) activeVar = false;
        await warehouseService.updateWarehouse(id, activeVar);

        return res.status(200).json({
            status: true,
            message: activeVar ? "Kho đã được hoạt động trở lại" : "Kho đã ngừng hoạt động",
            data: {}
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi cập nhật trạng thái kho",
            data: {}
        })
    }
};

// Xóa kho theo id
const deleteWarehouseByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id kho không được để trống",
            data: {}
        })
    }

    const existedWarehouse = await warehouseService.findWarehouseById(id);
    if (!existedWarehouse) {
        return res.status(404).json({
            status: false,
            message: `Kho '${id}' không tồn tại`,
            data: {}
        })
    }

    try {
        await warehouseService.deleteWarehouseById(id);

        return res.status(200).json({
            status: true,
            message: "Kho đã được xoá thành công",
            data: {}
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi xoá kho",
            data: {}
        })
    }
};

// Tìm một kho theo id
const getWarehouseByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id kho không được để trống",
            data: {}
        })
    }

    try {
        const warehouse = await warehouseService.findWarehouseById(id);
        if (!warehouse) {
            return res.status(404).json({
                status: false,
                message: `Kho '${id}' không tồn tại`,
                data: {}
            })
        }

        return res.status(200).json({
            status: true,
            message: "Lấy thông tin kho thành công",
            data: warehouse
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi lấy thông tin kho",
            data: {}
        })
    }
};

// Tìm tất cả kho
const getAllWarehousesHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    try {
        let warehouses = [];
        if (active === 'true' || active === true) warehouses = await warehouseService.findWarehouses({ status: { active: true }, offset, limit: parseInt(limit) });
        else if (active === 'false' || active === false) warehouses = await warehouseService.findWarehouses({ status: { active: false }, offset, limit: parseInt(limit) });
        else warehouses = await warehouseService.findWarehouses({ status: {}, offset, limit: parseInt(limit) });

        return res.status(200).json({
            status: true,
            message: "Lấy danh sách kho thành công",
            data: warehouses.rows,
            total: warehouses.count,
            page: parseInt(page),
            limit: parseInt(limit)
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi lấy danh sách kho",
            data: {}
        })
    }
};

// Public - Tìm tất cả kho
const getWarehousesHandler = async (req, res) => {
    try {
        let warehouses = [];
        warehouses = await warehouseService.findWarehouses({ status: { active: true } });
        return res.status(200).json({
            status: true,
            message: "Lấy danh sách kho thành công",
            data: warehouses.rows,
            total: warehouses.count,
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi lấy danh sách kho",
            data: {}
        })
    }
};

module.exports = {
    createWarehouseHandler,
    updateWarehouseByIdHandler,
    changeWarehouseStatusHandler,
    deleteWarehouseByIdHandler,
    getWarehouseByIdHandler,
    getAllWarehousesHandler,
    getWarehousesHandler
};