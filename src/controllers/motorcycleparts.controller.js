const motorcyclepartsService = require('../services/motorcycleparts.service');
const manufacturerService = require('../services/manufacturer.service');
const stockService = require('../services/stock.service');
const warehouseService = require('../services/warehouse.service');
const categoryService = require('../services/category.service');
const { uploadToMinio } = require('../middleware/uploadImages');
const minioClient = require('../configs/minio');
const { sequelize } = require('../models');

// Tạo một phụ tùng mới
const createMotorcyclepartsHandler = async (req, res) => {
    const { part_name, part_price, average_life, description, active, manufacturer_id, category_id, quantity_part } = req.body;
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

    // Tạo giao dịch (transaction) để đảm bảo tính toàn vẹn
    const t = await sequelize.transaction();

    try {
        // Tạo phụ tùng mới
        const motorcycleparts = await motorcyclepartsService.createMotorcycleparts({
            part_name,
            part_price,
            average_life,
            description,
            active,
            manufacturer_id,
            category_id,
            part_image: partImage
        }, { transaction: t });

        if (!motorcycleparts) {
            await t.rollback();
            return res.status(400).json({
                status: false,
                message: "Có lỗi xảy ra khi tạo phụ tùng",
                data: {}
            });
        }

        // Kiểm tra và tạo số lượng linh kiện (nếu có)
        if (quantity_part) {
            const { quantity, warehouse_id } = quantity_part;
            if (!quantity || !warehouse_id) {
                await t.rollback();
                return res.status(400).json({
                    status: false,
                    message: "Dữ liệu số lượng hoặc kho hàng không hợp lệ",
                    data: {}
                });
            }

            // Kiểm tra kho hàng có tồn tại
            const existedWarehouse = await warehouseService.findWarehouseById(warehouse_id);
            if (!existedWarehouse) {
                await t.rollback();
                return res.status(404).json({
                    status: false,
                    message: `Kho '${warehouse_id}' không tồn tại`,
                });
            }

            if (quantity < 0) {
                await t.rollback();
                return res.status(400).json({
                    status: false,
                    message: "Số lượng không hợp lệ",
                    data: {}
                });
            }

            // Tạo số lượng cho phụ tùng
            await stockService.createStock({
                quantity,
                warehouse_id,
                part_id: motorcycleparts.id
            }, { transaction: t });
        }

        // Commit transaction nếu tất cả đều thành công
        await t.commit();

        return res.status(201).json({
            status: true,
            message: "Phụ tùng đã được tạo thành công",
            data: {
                ...motorcycleparts,
                ...(quantity_part && { warehouse_id: quantity_part.warehouse_id, quantity: quantity_part.quantity })
            }
        });

    } catch (error) {
        // Rollback transaction nếu có lỗi xảy ra
        await t.rollback();
        return res.status(500).json({
            status: false,
            message: "Lỗi khi tạo phụ tùng hoặc số lượng",
            data: {}
        });
    }
};

// Cập nhật phụ tùng theo id
const updateMotorcyclepartsByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id phụ tùng không được để trống",
            data: {}
        });
    }

    const t = await sequelize.transaction();

    try {
        const existedPart = await motorcyclepartsService.findMotorcyclepartsById(id);
        if (!existedPart) {
            await t.rollback();
            return res.status(404).json({
                status: false,
                message: `Phụ tùng '${id}' không tồn tại`,
                data: {}
            });
        }

        if (existedPart.part_image && existedPart.part_image !== "" && existedPart.part_image !== null) {
            try {
                const fileName = existedPart.part_image.split('/').pop();
                await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
            } catch (err) {
                await t.rollback();
                return res.status(500).json({
                    status: false,
                    message: "Lỗi khi xóa ảnh cũ",
                    data: {}
                });
            }
        }

        let partImage;
        if (req.file) {
            try {
                partImage = await uploadToMinio(req.file);
            } catch (err) {
                await t.rollback();
                return res.status(500).json({
                    status: false,
                    message: "Lỗi khi tải ảnh lên",
                    data: {}
                });
            }
        }

        const { part_name, part_price, average_life, description, active, manufacturer_id, category_id, quantity_part } = req.body;

        if (!part_name || !part_price || !average_life || !manufacturer_id || !category_id) {
            await t.rollback();
            return res.status(400).json({
                status: false,
                message: "Các trường bắt buộc không được để trống",
                data: {}
            });
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
        }, { transaction: t });

        if (!updatedPart) {
            await t.rollback();
            return res.status(500).json({
                status: false,
                message: "Có lỗi xảy ra khi cập nhật phụ tùng",
                data: {}
            });
        }

        // Xử lý cập nhật số lượng phụ tùng trong kho
        if (quantity_part) {
            const { quantity, warehouse_id } = quantity_part;
            if (!quantity || !warehouse_id) {
                await t.rollback();
                return res.status(400).json({
                    status: false,
                    message: "Dữ liệu về số lượng hoặc kho không hợp lệ",
                    data: {}
                });
            }

            const existedWarehouse = await warehouseService.findWarehouseById(warehouse_id);
            if (!existedWarehouse) {
                await t.rollback();
                return res.status(404).json({
                    status: false,
                    message: `Kho '${warehouse_id}' không tồn tại`,
                    data: {}
                });
            }

            if (quantity < 0) {
                await t.rollback();
                return res.status(400).json({
                    status: false,
                    message: "Số lượng không hợp lệ",
                    data: {}
                });
            }

            const updatedStock = await stockService.updateStock({
                quantity,
                warehouse_id,
                part_id: id
            }, { transaction: t });

            if (!updatedStock) {
                await t.rollback();
                return res.status(500).json({
                    status: false,
                    message: "Có lỗi khi cập nhật số lượng phụ tùng trong kho",
                    data: {}
                });
            }
        }

        await t.commit();

        return res.status(200).json({
            status: true,
            message: "Phụ tùng đã được cập nhật thành công",
            data: {
                ...updatedPart.dataValues,
                ...(quantity_part && { warehouse_id: quantity_part.warehouse_id, quantity: quantity_part.quantity })
            }
        });
    } catch (err) {
        // Rollback nếu có lỗi
        await t.rollback();
        return res.status(500).json({
            status: false,
            message: "Có lỗi xảy ra trong quá trình xử lý",
            data: err.message
        });
    }
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

    const stockDeleted = await stockService.deleteStockById(existedPart.id);
    if (!stockDeleted) {
        return res.status(400).json({
            status: false,
            message: `Có lỗi xảy ra khi xóa số lượng linh kiện cho phụ tùng '${id}'`,
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

    const stock = await stockService.findStockById(id);
    if (!stock) {
        return res.status(404).json({
            status: false,
            message: `Không tìm thấy số lượng linh kiện cho phụ tùng '${id}'`,
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: "Lấy thông tin phụ tùng thành công",
        data: {
            ...part.dataValues,
            quantity: stock.quantity,
            warehouse_id: stock.warehouse_id
        }
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
        data: parts.rows.map(part => ({
            id: part.id,
            part_name: part.part_name,
            part_price: part.part_price,
            average_life: part.average_life,
            description: part.description,
            active: part.active,
            part_image: part.part_image,
            manufacturer_id: part.manufacturer_id,
            category_id: part.category_id,
            stocks: part.stocks.map(stock => ({
                quantity: stock.quantity,
                warehouse_id: stock.warehouse.id
            }))
        })),
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
        data: parts.rows.map(part => ({
            id: part.id,
            part_name: part.part_name,
            part_price: part.part_price,
            average_life: part.average_life,
            description: part.description,
            active: part.active,
            part_image: part.part_image,
            manufacturer_id: part.manufacturer_id,
            category_id: part.category_id,
            stocks: part.stocks.map(stock => ({
                quantity: stock.quantity,
                warehouse_id: stock.warehouse.id
            }))
        })),
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