const motorImageService = require('../services/motorImage.service');
const motorService = require('../services/motor.service');
const { uploadToMinio } = require('../middleware/uploadImages');
const minioClient = require('../configs/minio');

// Tạo một ảnh xe mới
const createMotorImageHandler = async (req, res) => {
    const { description, motor_id } = req.body;
    if (!motor_id) {
        return res.status(400).json({
            status: false,
            message: "Id xe không được để trống",
            data: {}
        })
    }

    const existedMotor = await motorService.findMotorById(motor_id);
    if (!existedMotor) {
        return res.status(404).json({
            status: false,
            message: `Xe '${motor_id}' không tồn tại`,
        })
    }

    let imageUrl;
    if (req.file) {
        try {
            imageUrl = await uploadToMinio(req.file);
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi tải ảnh lên",
                data: {}
            });
        }
    }

    const motorImage = await motorImageService.createMotorImage({
        image_url: imageUrl,
        description,
        motor_id
    });

    if (!motorImage) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi tạo ảnh xe",
            data: {}
        });
    }

    return res.status(201).json({
        status: true,
        message: "Ảnh xe đã được tạo thành công",
        data: motorImage
    });
};

// Cập nhật ảnh xe theo id
const updateMotorImageByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id ảnh xe không được để trống",
            data: {}
        })
    }

    let imageUrl;
    if (req.file) {
        try {
            imageUrl = await uploadToMinio(req.file);
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi tải ảnh lên",
                data: {}
            });
        }
    }

    const { description, motor_id } = req.body;
    const motorImage = await motorImageService.updateMotorImage(id, {
        ...(imageUrl && { image_url: imageUrl }),
        description,
        motor_id
    });

    if (!motorImage) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi cập nhật ảnh xe",
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: "Ảnh xe đã được cập nhật thành công",
        data: motorImage
    });

};

// Xoá ảnh xe theo id
const deleteMotorImageByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id ảnh xe không được để trống",
            data: {}
        })
    }

    const existedMotorImage = await motorImageService.findMotorImageById(id);
    if (!existedMotorImage) {
        return res.status(404).json({
            status: false,
            message: `Ảnh xe '${id}' không tồn tại`,
        })
    }

    try {
        const fileName = existedMotorImage.image_url.split('/').pop(); // Lấy tên file từ url
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
    } catch (err) {
        console.error('Lỗi khi xóa ảnh xe từ MinIO:', err);
        return res.status(500).json({
            status: false,
            message: "Lỗi khi xóa ảnh xe từ MinIO",
            data: {}
        });
    }

    const motorImage = await motorImageService.deleteMotorImageById(id);
    if (!motorImage) {
        return res.status(404).json({
            status: false,
            message: `Ảnh xe '${id}' không thể xoá`,
        })
    }
    return res.status(200).json({
        status: true,
        message: "Ảnh xe đã được xoá thành công",
        data: {}
    })
};

// Lấy thông tin ảnh xe theo id
const getMotorImageByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id ảnh xe không được để trống",
            data: {}
        })
    }

    const motorImage = await motorImageService.findMotorImageById(id);
    if (!motorImage) {
        return res.status(404).json({
            status: false,
            message: `Ảnh xe '${id}' không tồn tại`,
        })
    }

    return res.status(200).json({
        status: true,
        message: "Lấy thông tin ảnh xe thành công",
        data: motorImage
    })
};

// Lấy tất cả ảnh xe
const getAllMotorImagesHandler = async (req, res) => {
    const { motor_id } = req.query;
    let motorImages = [];
    motorImages = await motorImageService.findMotorImages(motor_id);
    return res.status(200).json({
        status: true,
        message: "Lấy tất cả ảnh xe thành công",
        data: motorImages.rows,
        total: motorImages.count,
    })
};

module.exports = {
    createMotorImageHandler,
    updateMotorImageByIdHandler,
    deleteMotorImageByIdHandler,
    getMotorImageByIdHandler,
    getAllMotorImagesHandler
};