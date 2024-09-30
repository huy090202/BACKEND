const motorImageService = require('../services/motorImage.service');
const motorService = require('../services/motor.service');
const { uploadToMinio } = require('../middleware/uploadImages');
const minioClient = require('../configs/minio');

// Create Motor Image
const createMotorImageHandler = async (req, res) => {
    const { description, motor_id } = req.body;
    if (!motor_id) {
        return res.status(400).json({
            status: false,
            message: "Required fields must not be empty",
            data: {}
        })
    }

    const existedMotor = await motorService.findMotorById(motor_id);
    if (!existedMotor) {
        return res.status(404).json({
            status: false,
            message: `Motor '${motor_id}' does not existed`,
        })
    }

    let imageUrl;
    if (req.file) {
        try {
            imageUrl = await uploadToMinio(req.file);
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Error uploading image",
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
            message: "Error creating motor image",
            data: {}
        });
    }

    return res.status(201).json({
        status: true,
        message: "Motor image created successfully",
        data: motorImage
    });
};

// Update Motor Image By Id
const updateMotorImageByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
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
                message: "Error uploading image",
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
            message: "Error updating motor image",
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: "Motor image updated successfully",
        data: motorImage
    });

};

// Delete Motor Image By Id
const deleteMotorImageByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        })
    }

    const existedMotorImage = await motorImageService.findMotorImageById(id);
    if (!existedMotorImage) {
        return res.status(404).json({
            status: false,
            message: `Motor image '${id}' does not existed`,
        })
    }

    try {
        const fileName = existedMotorImage.image_url.split('/').pop(); // Get image name from URL
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
    } catch (err) {
        console.error('Error deleting image from MinIO:', err);
        return res.status(500).json({
            status: false,
            message: "Error deleting image from MinIO",
            data: {}
        });
    }

    const motorImage = await motorImageService.deleteMotorImageById(id);
    if (!motorImage) {
        return res.status(404).json({
            status: false,
            message: `Motor image '${id}' does not existed`,
        })
    }
    return res.status(200).json({
        status: true,
        message: "Motor image was deleted successfully",
        data: {}
    })
};

// Get Motor Image By Id
const getMotorImageByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        })
    }

    const motorImage = await motorImageService.findMotorImageById(id);
    if (!motorImage) {
        return res.status(404).json({
            status: false,
            message: `Motor image '${id}' does not existed`,
        })
    }

    return res.status(200).json({
        status: true,
        message: "Success",
        data: motorImage
    })
};

// Get All Motor Images
const getAllMotorImagesHandler = async (req, res) => {
    const { motor_id } = req.query;
    let motorImages = [];
    motorImages = await motorImageService.findMotorImages(motor_id);
    return res.status(200).json({
        status: true,
        message: "Success",
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