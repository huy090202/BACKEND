const { parse } = require('dotenv');
const manufacturerService = require('../services/manufacturer.service');

// Tạo một nhà sản xuất mới
const createManufacturerHandler = async (req, res) => {
    const { name, country, active } = req.body;
    if (!name) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        });
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Trạng thái phải là true hoặc false",
        });
    }

    const existedManufacturer = await manufacturerService.findManufacturerByName(name);
    if (existedManufacturer) {
        return res.status(400).json({
            status: false,
            message: "Nhà sản xuất đã tồn tại",
            data: {}
        });
    }

    try {
        const manufacturer = await manufacturerService.createManufacturer(req.body);
        if (!manufacturer) {
            return res.status(500).json({
                status: false,
                message: "Có lỗi xảy ra khi tạo nhà sản xuất",
                data: {}
            });
        }

        return res.status(201).json({
            status: true,
            message: "Nhà sản xuất đã được tạo thành công",
            data: manufacturer
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi tạo nhà sản xuất",
            data: {}
        });
    }
};

// Cập nhật thông tin nhà sản xuất theo id
const updateManufacturerByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id nhà sản xuất không được để trống",
            data: {}
        });
    }

    const { name, country, active } = req.body;
    if (!name) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        });
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Trạng thái phải là true hoặc false",
        });
    }

    const existedManufacturer = await manufacturerService.findManufacturerById(id);
    if (!existedManufacturer) {
        return res.status(404).json({
            status: false,
            message: `Nhà sản xuất '${id}' không tồn tại`,
            data: {}
        });
    }

    try {
        const manufacturer = await manufacturerService.updateManufacturerById(id, req.body);
        if (!manufacturer) {
            return res.status(500).json({
                status: false,
                message: "Có lỗi xảy ra khi cập nhật nhà sản xuất",
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: "Nhà sản xuất đã được cập nhật thành công",
            data: manufacturer
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi cập nhật nhà sản xuất",
            data: {}
        });
    }
};

// Cập nhật trạng thái nhà sản xuất
const changeManufacturerStatusHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id nhà sản xuất không được để trống",
            data: {}
        });
    }

    try {
        const existedManufacturer = await manufacturerService.findManufacturerById(id);
        if (!existedManufacturer) {
            return res.status(404).json({
                status: false,
                message: `Nhà sản xuất '${id}' không tồn tại`,
                data: {}
            });
        }

        const { active } = req.body;
        let activeVar = true;
        if (active === 'false' || active === false) activeVar = false;
        await manufacturerService.updateManufacturer(id, activeVar);

        return res.status(200).json({
            status: true,
            message: activeVar ? "Nhà sản xuất đã được kích hoạt" : "Nhà sản xuất đã được vô hiệu hóa",
            data: {}
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi cập nhật trạng thái nhà sản xuất",
            data: {}
        });
    }
};

// Xóa nhà sản xuất theo id
const deleteManufacturerByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id nhà sản xuất không được để trống",
            data: {}
        });
    }

    try {
        const manufacturer = await manufacturerService.deleteManufacturerById(id);
        if (!manufacturer) {
            return res.status(500).json({
                status: false,
                message: `Nhà sản xuất '${id}' không tồn tại`,
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: "Nhà sản xuất đã được xoá thành công",
            data: {}
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi xoá nhà sản xuất",
            data: {}
        });
    }
};

// Tìm một nhà sản xuất theo id
const getManufacturerByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id nhà sản xuất không được để trống",
            data: {}
        });
    }

    try {
        const manufacturer = await manufacturerService.findManufacturerById(id);
        if (!manufacturer) {
            return res.status(404).json({
                status: false,
                message: `Nhà sản xuất '${id}' không tồn tại`,
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: "Lấy thông tin nhà sản xuất thành công",
            data: manufacturer
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi lấy thông tin nhà sản xuất",
            data: {}
        });
    }
};

// Tìm tất cả nhà sản xuất
const getAllManufacturersHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    try {
        let manufacturers = [];
        if (active === 'true' || active === true) manufacturers = await manufacturerService.findManufacturers({ status: { active: true }, offset, limit: parseInt(limit) });
        else if (active === 'false' || active === false) manufacturers = await manufacturerService.findManufacturers({ status: { active: false }, offset, limit: parseInt(limit) });
        else manufacturers = await manufacturerService.findManufacturers({ status: {}, offset, limit: parseInt(limit) });

        return res.status(200).json({
            status: true,
            message: "Lấy danh sách nhà sản xuất thành công",
            data: manufacturers.rows,
            total: manufacturers.count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi lấy danh sách nhà sản xuất",
            data: {}
        });
    }
};

// Hiển thị tất cả nhà sản xuất có active = true
const getManufacturersHandler = async (req, res) => {
    try {
        let manufacturers = [];
        manufacturers = await manufacturerService.findManufacturers({ status: { active: true } });

        return res.status(200).json({
            status: true,
            message: "Lấy danh sách nhà sản xuất thành công",
            data: manufacturers.rows,
            total: manufacturers.count,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra khi lấy danh sách nhà sản xuất",
            data: {}
        });
    }
};

module.exports = {
    createManufacturerHandler,
    updateManufacturerByIdHandler,
    changeManufacturerStatusHandler,
    deleteManufacturerByIdHandler,
    getManufacturerByIdHandler,
    getAllManufacturersHandler,
    getManufacturersHandler
};