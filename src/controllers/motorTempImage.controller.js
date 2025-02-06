const motorTempImageService = require('../services/motorTempImage.service');
const motorTempService = require('../services/motorTemp.service');
const { uploadToMinio } = require('../middleware/uploadImages');
const minioClient = require('../configs/minio');

// Tạo một ảnh xe tạm mới
const createMotorTempImageHandler = async (req, res) => {
    const { description, motorTemp_id } = req.body;
    if (!motorTemp_id) {
        return res.status(400).json({
            status: false,
            message: "Id xe tạm không được để trống",
            data: {}
        })
    }

    const existedMotorTemp = await motorTempService.findMotorTempById(motorTemp_id);
    if (!existedMotorTemp) {
        return res.status(404).json({
            status: false,
            message: `Xe tạm '${motorTemp_id}' không tồn tại`,
        })
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
        try {
            for (let file of req.files) {
                const imageUrl = await uploadToMinio(file);
                imageUrls.push(imageUrl);
            }
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi tải ảnh lên",
                data: {}
            });
        }
    }

    try {
        const motorTempImages = await Promise.all(
            imageUrls.map(async (imageUrl) => {
                return await motorTempImageService.createMotorTempImage({
                    image_url: imageUrl,
                    description,
                    motorTemp_id,
                });
            })
        )

        if (!motorTempImages || motorTempImages.length === 0) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi tạo ảnh xe tạm",
                data: {}
            });
        }

        return res.status(201).json({
            status: true,
            message: "Ảnh xe tạm đã được tạo thành công",
            data: motorTempImages
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi tạo ảnh xe tạm",
            data: {}
        });
    }
};

// Tìm tất cả ảnh xe tạm
const getAllMotorTempImagesHandler = async (req, res) => {
    const { motorTemp_id } = req.query;
    if (!motorTemp_id) {
        return res.status(400).json({
            status: false,
            message: "Id xe tạm không được để trống",
            data: {}
        })
    }

    try {
        let motorTempImages = [];
        motorTempImages = await motorTempImageService.findMotorTempImages(motorTemp_id);
        return res.status(200).json({
            status: true,
            message: "Lấy tất cả ảnh xe tạm thành công",
            data: motorTempImages.rows,
            total: motorTempImages.count
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi lấy tất cả ảnh xe tạm",
            data: {}
        });
    }
};

module.exports = {
    createMotorTempImageHandler,
    getAllMotorTempImagesHandler
};