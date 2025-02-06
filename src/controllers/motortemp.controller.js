const motorTempService = require('../services/motorTemp.service');
const motorService = require('../services/motor.service');
const { EMAIL_VALIDATION, PHONE_NUMBER_VALIDATION, ENGINE_CHASSIS_NUMBER_VALIDATION, LICENSE_PLATE_VALIDATION } = require('../utils/validations');

// Tạo một xe tạm mới
const createMotorTempHandler = async (req, res) => {
    const { email, phone, motor_name, motor_type, motor_color, license_plate, engine_number, chassis_number, motor_model, created_at } = req.body;
    if (!email || !phone || !motor_name || !motor_type || !motor_color || !license_plate || !engine_number || !chassis_number || !motor_model || !created_at) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        })
    }

    if (!email.match(EMAIL_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Định dạng email không hợp lệ",
            data: {}
        })
    }

    if (!phone.match(PHONE_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Số điện thoại phải có 10 chữ số",
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

    // Kiểm tra thông tin xe tạm đã tồn tại trong model xe tạm chưa
    const existedMotorTempLicensePlate = await motorTempService.findMotorTempByLicensePlate(license_plate);
    if (existedMotorTempLicensePlate) {
        return res.status(400).json({
            status: false,
            message: "Biển số xe tạm đã tồn tại",
            data: {}
        })
    }

    const existedMotorTempChassisNumber = await motorTempService.findMotorTempByChassisNumber(chassis_number);
    if (existedMotorTempChassisNumber) {
        return res.status(400).json({
            status: false,
            message: "Số khung xe tạm đã tồn tại",
            data: {}
        })
    }

    // Kiểm tra thông tin xe tạm đã tồn tại trong model xe chính thức chưa
    const existedLicensePlate = await motorService.findMotorByLicensePlate(license_plate);
    if (existedLicensePlate) {
        return res.status(400).json({
            status: false,
            message: "Biển số xe đã tồn tại",
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

    try {
        const motorTemp = await motorTempService.createMotorTemp({ email, phone, motor_name, motor_type, motor_color, license_plate, engine_number, chassis_number, motor_model, created_at });
        if (!motorTemp) {
            return res.status(500).json({
                status: false,
                message: "Xe đã được tạo thất bại",
                data: {}
            })
        }

        return res.status(201).json({
            status: true,
            message: "Xe đã được tạo thành công",
            data: motorTemp
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Xe đã được tạo thất bại",
            data: {}
        })
    }
};

// Tìm một xe tạm theo id
const updateMotorTempByIdHandler = async (req, res) => { };

// Cập nhật xe tạm theo id
const deleteMotorTempByIdHandler = async (req, res) => { };

// Xóa xe tạm theo id
const getMotorTempByIdHandler = async (req, res) => { };

// Tìm tất cả xe tạm 
const getAllMotorTempsHandler = async (req, res) => {
    try {
        let motorTemps = [];
        motorTemps = await motorTempService.findMotorTemps();
        return res.status(200).json({
            status: true,
            message: "Lấy tất cả xe thành công",
            data: motorTemps.rows.map((item) => ({
                id: item.id,
                email: item.email,
                phone: item.phone,
                motor_name: item.motor_name,
                motor_type: item.motor_type,
                motor_color: item.motor_color,
                license_plate: item.license_plate,
                engine_number: item.engine_number,
                chassis_number: item.chassis_number,
                motor_model: item.motor_model,
                created_at: item.created_at,
            })),
            total: motorTemps.count,
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Lấy tất cả xe thất bại",
            data: {}
        })
    }
};

module.exports = {
    createMotorTempHandler,
    updateMotorTempByIdHandler,
    deleteMotorTempByIdHandler,
    getMotorTempByIdHandler,
    getAllMotorTempsHandler
}