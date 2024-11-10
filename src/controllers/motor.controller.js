const motorService = require('../services/motor.service');
const motorImageService = require('../services/motorImage.service');
const userService = require('../services/user.service');
const { ENGINE_CHASSIS_NUMBER_VALIDATION, LICENSE_PLATE_VALIDATION } = require('../utils/validations');

// Tạo một xe mới
const createMotorHandler = async (req, res) => {
    const { id } = req.user;
    const { motor_name, motor_type, motor_color, license_plate, engine_number, chassis_number, motor_model, created_at } = req.body;
    if (!motor_name || !motor_type || !motor_color || !license_plate || !engine_number || !chassis_number || !motor_model || !created_at) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        })
    }

    if (motor_type !== 'Xe số' && motor_type !== 'Xe ga' && motor_type !== 'Xe côn' && motor_type !== 'Xe phân khối lớn' && motor_type !== 'Xe khác') {
        return res.status(400).json({
            status: false,
            message: "Loại xe phải là xe số, xe ga, xe côn, xe phân khối lớn hoặc xe khác",
            data: {}
        })
    }

    if (!license_plate.match(LICENSE_PLATE_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Biển số xe không hợp lệ",
            data: {}
        })
    }

    if (!engine_number.match(ENGINE_CHASSIS_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Số máy không hợp lệ",
            data: {}
        })
    }

    if (!chassis_number.match(ENGINE_CHASSIS_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Số khung không hợp lệ",
            data: {}
        })
    }

    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    if (createdAtDate > currentDate) {
        return res.status(400).json({
            status: false,
            message: "Ngày đăng ký xe không thể ở tương lai",
            data: {}
        });
    }

    const existedLicensePlate = await motorService.findMotorByLicensePlate(license_plate);
    if (existedLicensePlate) {
        return res.status(400).json({
            status: false,
            message: "Biển số xe đã tồn tại",
            data: {}
        })
    }

    const existedEngineNumber = await motorService.findMotorByEngineNumber(engine_number);
    if (existedEngineNumber) {
        return res.status(400).json({
            status: false,
            message: "Số máy xe đã tồn tại",
            data: {}
        })
    }

    const existedChassisNumber = await motorService.findMotorByChassisNumber(chassis_number);
    if (existedChassisNumber) {
        return res.status(400).json({
            status: false,
            message: "Số khung xe đã tồn tại",
            data: {}
        })
    }

    const existedUser = await userService.getUserProfile(id);
    if (!existedUser) {
        return res.status(400).json({
            status: false,
            message: "Chủ xe không tồn tại",
            data: {}
        })
    }

    const motor = await motorService.createMotor({ motor_name, motor_type, motor_color, license_plate, engine_number, chassis_number, motor_model, created_at, user_id: id });
    return res.status(201).json({
        status: true,
        message: "Xe đã được tạo thành công",
        data: motor
    })
};

// Cập nhật xe theo id
const updateMotorByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id xe không được để trống",
            data: {}
        })
    }

    const { motor_name, motor_type, motor_color, license_plate, engine_number, chassis_number, motor_model, created_at } = req.body;
    if (!motor_name || !motor_type || !motor_color || !license_plate || !engine_number || !chassis_number || !motor_model || !created_at) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        })
    }

    if (motor_type !== 'Xe số' && motor_type !== 'Xe ga' && motor_type !== 'Xe côn' && motor_type !== 'Xe phân khối lớn' && motor_type !== 'Xe khác') {
        return res.status(400).json({
            status: false,
            message: "Loại xe phải là xe số, xe ga, xe côn, xe phân khối lớn hoặc xe khác",
            data: {}
        })
    }

    if (!license_plate.match(LICENSE_PLATE_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Biển số xe không hợp lệ",
            data: {}
        })
    }

    if (!engine_number.match(ENGINE_CHASSIS_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Số máy không hợp lệ",
            data: {}
        })
    }

    if (!chassis_number.match(ENGINE_CHASSIS_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Số khung không hợp lệ",
            data: {}
        })
    }

    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    if (createdAtDate > currentDate) {
        return res.status(400).json({
            status: false,
            message: "Ngày đăng ký xe không thể ở tương lai",
            data: {}
        });
    }

    const existedMotor = await motorService.findMotorById(id);
    if (!existedMotor) {
        return res.status(404).json({
            status: false,
            message: `Xe '${id}' không tồn tại`,
        })
    }

    const motor = await motorService.updateMotorById(id, req.body);
    return res.status(200).json({
        status: true,
        message: "Xe đã được cập nhật thành công",
        data: motor
    })
};

// Xoá xe theo id
const deleteMotorByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id xe không được để trống",
        })
    }

    const existedMotor = await motorService.findMotorById(id);
    if (!existedMotor) {
        return res.status(404).json({
            status: false,
            message: `Xe '${id}' không tồn tại`,
        })
    }

    const deletedMotorImages = await motorImageService.deleteMotorImageByMotorId(id);
    if (deletedMotorImages) {
        const motor = await motorService.deleteMotorById(id);
        if (!motor) {
            return res.status(404).json({
                status: false,
                message: `Xe '${id}' không thể xoá`,
            })
        }
        return res.status(200).json({
            status: true,
            message: "Xe đã được xoá thành công",
            data: {}
        })
    }

};

// Lấy thông tin xe theo id
const getMotorByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id xe không được để trống",
        })
    }

    const motor = await motorService.findMotorById(id);
    if (!motor) {
        return res.status(404).json({
            status: false,
            message: `Xe '${id}' không tồn tại`,
        })
    }
    return res.status(200).json({
        status: true,
        message: "Lấy thông tin xe thành công",
        data: motor
    })
};

// Lấy tất cả xe của người dùng
const getAllMotorsHandler = async (req, res) => {
    const { id } = req.user;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let motors = [];
    motors = await motorService.findMotors({ userId: { user_id: id }, offset, limit: parseInt(limit) });
    return res.status(200).json({
        status: true,
        message: "Lấy tất cả xe thành công",
        data: motors.rows,
        total: motors.count,
        page: parseInt(page),
        limit: parseInt(limit)
    })
};

module.exports = {
    createMotorHandler,
    updateMotorByIdHandler,
    deleteMotorByIdHandler,
    getMotorByIdHandler,
    getAllMotorsHandler
};