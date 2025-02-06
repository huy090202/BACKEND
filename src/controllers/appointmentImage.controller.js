const appointmentImageService = require('../services/appointmentImage.service');
const appointmentService = require('../services/appointment.service');
const { uploadToMinio } = require('../middleware/uploadImages');
const minioClient = require('../configs/minio');

// Tạo mới một ảnh tình trạng xe cho lịch hẹn
const createAppointmentImageHandler = async (req, res) => {
    const { description, appointment_id } = req.body;
    if (!appointment_id) {
        return res.status(400).json({
            status: false,
            message: "Id lịch hẹn không được để trống",
            data: {}
        })
    }

    const existedAppointment = await appointmentService.findAppointmentById(appointment_id);
    if (!existedAppointment) {
        return res.status(404).json({
            status: false,
            message: `Lịch hẹn '${appointment_id}' không tồn tại`,
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
        const appointmentImages = await Promise.all(
            imageUrls.map((url) => appointmentImageService.createAppointmentImage({
                image_url: url,
                description,
                appointment_id
            }))
        )

        if (!appointmentImages || appointmentImages.length === 0) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi tạo ảnh tình trạng xe",
                data: {}
            });
        }

        return res.status(201).json({
            status: true,
            message: "Ảnh tình trạng xe đã được tạo thành công",
            data: appointmentImages
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi tạo ảnh tình trạng xe",
            data: {}
        });
    }
};

// Cập nhật ảnh tình trạng xe cho lịch hẹn theo id
const updateAppointmentImageByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id ảnh tình trạng xe không được để trống",
            data: {}
        })
    }

    const existedAppointmentImage = await appointmentImageService.findAppointmentImageById(id);
    if (!existedAppointmentImage) {
        return res.status(404).json({
            status: false,
            message: `Ảnh tình trạng xe '${id}' không tồn tại`,
        })
    }

    // Xóa ảnh cũ trên MinIO và trong database
    if (existedAppointmentImage.image_url && existedAppointmentImage.image_url !== "" && existedAppointmentImage.image_url !== null) {
        try {
            const fileName = existedAppointmentImage.image_url.split('/').pop();
            await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Ảnh tình trạng xe không tồn tại",
                data: {}
            });
        }
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

    try {
        const { description, appointment_id } = req.body;
        const appointmentImage = await appointmentImageService.updateAppointmentImage(id, {
            ...(imageUrl && { image_url: imageUrl }),
            description,
            appointment_id
        });

        if (!appointmentImage) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi cập nhật ảnh tình trạng xe",
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: "Ảnh tình trạng xe đã được cập nhật thành công",
            data: appointmentImage
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi cập nhật ảnh tình trạng xe",
            data: {}
        });
    }
};

// Xóa ảnh tình trạng xe cho lịch hẹn theo id
const deleteAppointmentImageByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id ảnh tình trạng xe không được để trống",
            data: {}
        })
    }

    const existedAppointmentImage = await appointmentImageService.findAppointmentImageById(id);
    if (!existedAppointmentImage) {
        return res.status(404).json({
            status: false,
            message: `Ảnh tình trạng xe '${id}' không tồn tại`,
        })
    }

    try {
        const fileName = existedAppointmentImage.image_url.split('/').pop();
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi xóa ảnh tình trạng xe từ MinIO",
            data: {}
        });
    }

    try {
        const appointmentImage = await appointmentImageService.deleteAppointmentImageById(id);
        if (!appointmentImage) {
            return res.status(500).json({
                status: false,
                message: `Ảnh tình trạng xe '${id}' không thể xoá`,
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: "Ảnh tình trạng xe đã được xóa thành công",
            data: {}
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi xóa ảnh tình trạng xe",
            data: {}
        });
    }
};

// Lấy ảnh tình trạng xe cho lịch hẹn theo id
const getAppointmentImageByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id ảnh tình trạng xe không được để trống",
            data: {}
        })
    }

    try {
        const appointmentImage = await appointmentImageService.findAppointmentImageById(id);
        if (!appointmentImage) {
            return res.status(404).json({
                status: false,
                message: `Ảnh tình trạng xe '${id}' không tồn tại`,
            })
        }

        return res.status(200).json({
            status: true,
            message: "Lấy ảnh tình trạng xe thành công",
            data: appointmentImage
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi lấy ảnh tình trạng xe",
            data: {}
        });
    }
};

// Lấy tất cả ảnh tình trạng xe cho lịch hẹn
const getAllAppointmentImagesHandler = async (req, res) => {
    const { appointment_id } = req.query;
    if (!appointment_id) {
        return res.status(400).json({
            status: false,
            message: "Id lịch hẹn không được để trống",
            data: {}
        })
    }

    try {
        let appointmentImages = [];
        appointmentImages = await appointmentImageService.findAppointmentImages(appointment_id);
        return res.status(200).json({
            status: true,
            message: "Lấy tất cả ảnh tình trạng xe thành công",
            data: appointmentImages.rows,
            total: appointmentImages.count
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Lỗi khi lấy tất cả ảnh tình trạng xe",
            data: {}
        });
    }
};

module.exports = {
    createAppointmentImageHandler,
    updateAppointmentImageByIdHandler,
    deleteAppointmentImageByIdHandler,
    getAppointmentImageByIdHandler,
    getAllAppointmentImagesHandler
};