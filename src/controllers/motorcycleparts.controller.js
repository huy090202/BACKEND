const motorcyclepartsService = require('../services/motorcycleparts.service');
const manufacturerService = require('../services/manufacturer.service');
const categoryService = require('../services/category.service');
const { uploadToMinio } = require('../middleware/uploadImages');
const minioClient = require('../configs/minio');

// Tạo một phụ tùng mới
const createMotorcyclepartsHandler = async (req, res) => {
    const { part_name, part_price, average_life, description, active, manufacturer_id, category_id } = req.body;
    if (!part_name || !part_price || !average_life || !manufacturer_id || !category_id) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        })
    }

    if (part_price <= 0) {
        return res.status(400).json({
            status: false,
            message: "Giá phải lớn hơn 0",
            data: {}
        })
    }

    if (average_life <= 0) {
        return res.status(400).json({
            status: false,
            message: "Tuổi thọ trung bình phải lớn hơn 0",
            data: {}
        })
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Trạng thái phải là true hoặc false",
        })
    }

    const existedPart = await motorcyclepartsService.findMotorcyclepartsByName(part_name);
    if (existedPart) {
        return res.status(400).json({
            status: false,
            message: "Phụ tùng đã tồn tại",
            data: {}
        })
    }

    let partImage;
    if (req.file) {
        try {
            partImage = await uploadToMinio(req.file);
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi tải ảnh lên",
                data: {}
            });
        }
    }

    const existedManufacturer = await manufacturerService.findManufacturerById(manufacturer_id);
    if (!existedManufacturer) {
        return res.status(400).json({
            status: false,
            message: "Nhà sản xuất không tồn tại",
            data: {}
        })
    }

    const existedCategory = await categoryService.findCategoryById(category_id);
    if (!existedCategory) {
        return res.status(400).json({
            status: false,
            message: "Danh mục không tồn tại",
            data: {}
        })
    }

    const motorcycleparts = await motorcyclepartsService.createMotorcycleparts({
        part_name,
        part_price,
        average_life,
        description,
        active,
        manufacturer_id,
        category_id,
        part_image: partImage
    });

    if (!motorcycleparts) {
        return res.status(400).json({
            status: false,
            message: "Có lỗi xảy ra khi tạo phụ tùng",
            data: {}
        })
    }

    return res.status(201).json({
        status: true,
        message: "Phụ tùng đã được tạo thành công",
        data: motorcycleparts
    })
};

// Cập nhật phụ tùng theo id
const updateMotorcyclepartsByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id phụ tùng không được để trống",
            data: {}
        })
    }

    const existedPart = await motorcyclepartsService.findMotorcyclepartsById(id);
    if (!existedPart) {
        return res.status(400).json({
            status: false,
            message: `Phụ tùng '${id}' không tồn tại`,
            data: {}
        })
    }

    if (existedPart.part_image && existedPart.part_image !== "" && existedPart.part_image !== null) {
        try {
            const filenName = existedPart.part_image.split('/').pop();
            await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, filenName);
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Ảnh linh kiện không tồn tại",
                data: {}
            });
        }
    }

    let partImage;
    if (req.file) {
        try {
            partImage = await uploadToMinio(req.file);
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi tải ảnh lên",
                data: {}
            });
        }
    }

    const { part_name, part_price, average_life, description, active, manufacturer_id, category_id } = req.body;

    if (!part_name || !part_price || !average_life || !manufacturer_id || !category_id) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        })
    }

    if (part_price <= 0) {
        return res.status(400).json({
            status: false,
            message: "Giá phải lớn hơn 0",
            data: {}
        })
    }

    if (average_life <= 0) {
        return res.status(400).json({
            status: false,
            message: "Tuổi thọ trung bình phải lớn hơn 0",
            data: {}
        })
    }

    if (active !== undefined && active !== null && typeof active !== 'boolean') {
        return res.status(400).json({
            status: false,
            message: "Trạng thái phải là true hoặc false",
        })
    }

    const existedManufacturer = await manufacturerService.findManufacturerById(manufacturer_id);
    if (!existedManufacturer) {
        return res.status(400).json({
            status: false,
            message: "Nhà sản xuất không tồn tại",
            data: {}
        })
    }

    const existedCategory = await categoryService.findCategoryById(category_id);
    if (!existedCategory) {
        return res.status(400).json({
            status: false,
            message: "Danh mục không tồn tại",
            data: {}
        })
    }

    const updatedPart = await motorcyclepartsService.updateMotorcycleparts(id, {
        part_name,
        part_price,
        average_life,
        description,
        active,
        manufacturer_id,
        category_id,
        ...(partImage && { part_image: partImage })
    });

    if (!updatedPart) {
        return res.status(400).json({
            status: false,
            message: "Có lỗi xảy ra khi cập nhật phụ tùng",
            data: {}
        })
    }

    return res.status(200).json({
        status: true,
        message: "Phụ tùng đã được cập nhật thành công",
        data: updatedPart
    })
};

// Cập nhật trạng thái phụ tùng
const changeMotorcyclepartsStatusHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id phụ tùng không được để trống",
            data: {}
        })
    }

    const existedPart = await motorcyclepartsService.findMotorcyclepartsById(id);
    if (!existedPart) {
        return res.status(400).json({
            status: false,
            message: `Phụ tùng '${id}' không tồn tại`,
            data: {}
        })
    }

    const { active } = req.body;
    let activeVar = true;
    if (active === 'false' || active === false) activeVar = false;
    await motorcyclepartsService.updateMotorcyclepartsById(id, activeVar);

    return res.status(200).json({
        status: true,
        message: activeVar ? "Phụ tùng đã được kích hoạt" : "Phụ tùng đã được vô hiệu hóa",
        data: {}
    })
};

// Xóa phụ tùng theo id
const deleteMotorcyclepartsByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id phụ tùng không được để trống",
            data: {}
        })
    }

    const existedPart = await motorcyclepartsService.findMotorcyclepartsById(id);
    if (!existedPart) {
        return res.status(400).json({
            status: false,
            message: `Phụ tùng '${id}' không tồn tại`,
            data: {}
        })
    }

    try {
        const fileName = existedPart.part_image.split('/').pop();
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Ảnh linh kiện không tồn tại",
            data: {}
        });
    }

    const part = await motorcyclepartsService.deleteMotorcyclepartsById(id);
    if (!part) {
        return res.status(400).json({
            status: false,
            message: `Có lỗi xảy ra khi xóa phụ tùng '${id}'`,
            data: {}
        })
    }

    return res.status(200).json({
        status: true,
        message: "Phụ tùng đã được xóa thành công",
        data: {}
    })
};

// Tìm một phụ tùng theo id
const getMotorcyclepartsByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id phụ tùng không được để trống",
            data: {}
        })
    }

    const part = await motorcyclepartsService.findMotorcyclepartsById(id);
    if (!part) {
        return res.status(404).json({
            status: false,
            message: `Phụ tùng '${id}' không tồn tại`,
            data: {}
        })
    }

    return res.status(200).json({
        status: true,
        message: "Lấy thông tin phụ tùng thành công",
        data: part
    })
};

// Tìm tất cả phụ tùng
const getAllMotorcyclepartsHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let parts = [];
    if (active === 'true' || active === true)
        parts = await motorcyclepartsService.findMotorcycleparts({ status: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        parts = await motorcyclepartsService.findMotorcycleparts({ status: { active: false }, offset, limit: parseInt(limit) });
    else
        parts = await motorcyclepartsService.findMotorcycleparts({ status: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "Lấy thông tin phụ tùng thành công",
        data: parts.rows,
        total: parts.count,
        page: parseInt(page),
        limit: parseInt(limit)
    })
};

// Public - Tìm tất cả phụ tùng
const getMotorcyclepartsHandler = async (req, res) => {
    let parts = [];
    parts = await motorcyclepartsService.findMotorcycleparts({ status: { active: true } });
    return res.status(200).json({
        status: true,
        message: "Lấy thông tin phụ tùng thành công",
        data: parts.rows,
        total: parts.count
    })
};

module.exports = {
    createMotorcyclepartsHandler,
    updateMotorcyclepartsByIdHandler,
    changeMotorcyclepartsStatusHandler,
    deleteMotorcyclepartsByIdHandler,
    getMotorcyclepartsByIdHandler,
    getAllMotorcyclepartsHandler,
    getMotorcyclepartsHandler
};