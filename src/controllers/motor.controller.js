const motorService = require('../services/motor.service');
const userService = require('../services/user.service');
const { ENGINE_CHASSIS_NUMBER_VALIDATION, LICENSE_PLATE_VALIDATION } = require('../utils/validations');

// Create Motor
const createMotorHandler = async (req, res) => {
    const { id } = req.user;
    const { motor_name, motor_type, motor_color, license_plate, engine_number, chassis_number, motor_model, created_at } = req.body;
    if (!motor_name || !motor_type || !motor_color || !license_plate || !engine_number || !chassis_number || !motor_model || !created_at) {
        return res.status(400).json({
            status: false,
            message: "Required fields must not be empty",
            data: {}
        })
    }

    if (motor_type !== 'UNDERBONE' && motor_type !== 'SCOOTER' && motor_type !== 'MANUAL' && motor_type !== 'BIGBIKE') {
        return res.status(400).json({
            status: false,
            message: "Motor type must be UNDERBONE, SCOOTER, MANUAL or BIGBIKE",
            data: {}
        })
    }

    if (!license_plate.match(LICENSE_PLATE_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "License plate is invalid",
            data: {}
        })
    }

    if (!engine_number.match(ENGINE_CHASSIS_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Engine number is invalid",
            data: {}
        })
    }

    if (!chassis_number.match(ENGINE_CHASSIS_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Chassis number is invalid",
            data: {}
        })
    }

    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    if (createdAtDate > currentDate) {
        return res.status(400).json({
            status: false,
            message: "Created date cannot be in the future",
            data: {}
        });
    }

    const existedLicensePlate = await motorService.findMotorByLicensePlate(license_plate);
    if (existedLicensePlate) {
        return res.status(400).json({
            status: false,
            message: "Motor license plate already existed",
            data: {}
        })
    }

    const existedEngineNumber = await motorService.findMotorByEngineNumber(engine_number);
    if (existedEngineNumber) {
        return res.status(400).json({
            status: false,
            message: "Motor engine number already existed",
            data: {}
        })
    }

    const existedChassisNumber = await motorService.findMotorByChassisNumber(chassis_number);
    if (existedChassisNumber) {
        return res.status(400).json({
            status: false,
            message: "Motor chassis number already existed",
            data: {}
        })
    }

    const existedUser = await userService.getUserProfile(id);
    if (!existedUser) {
        return res.status(400).json({
            status: false,
            message: "User not found",
            data: {}
        })
    }

    const motor = await motorService.createMotor({ motor_name, motor_type, motor_color, license_plate, engine_number, chassis_number, motor_model, created_at, user_id: id });
    return res.status(201).json({
        status: true,
        message: "Motor created successfully",
        data: motor
    })
};

// Update Motor By Id
const updateMotorByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
            data: {}
        })
    }

    const { motor_name, motor_type, motor_color, license_plate, engine_number, chassis_number, motor_model, created_at } = req.body;
    if (!motor_name || !motor_type || !motor_color || !license_plate || !engine_number || !chassis_number || !motor_model || !created_at) {
        return res.status(400).json({
            status: false,
            message: "Required fields must not be empty",
            data: {}
        })
    }

    if (motor_type !== 'UNDERBONE' && motor_type !== 'SCOOTER' && motor_type !== 'MANUAL' && motor_type !== 'BIGBIKE') {
        return res.status(400).json({
            status: false,
            message: "Motor type must be UNDERBONE, SCOOTER, MANUAL or BIGBIKE",
            data: {}
        })
    }

    if (!license_plate.match(LICENSE_PLATE_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "License plate is invalid",
            data: {}
        })
    }

    if (!engine_number.match(ENGINE_CHASSIS_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Engine number is invalid",
            data: {}
        })
    }

    if (!chassis_number.match(ENGINE_CHASSIS_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Chassis number is invalid",
            data: {}
        })
    }

    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    if (createdAtDate > currentDate) {
        return res.status(400).json({
            status: false,
            message: "Created date cannot be in the future",
            data: {}
        });
    }

    const existedMotor = await motorService.findMotorById(id);
    if (!existedMotor) {
        return res.status(404).json({
            status: false,
            message: `Motor '${id}' does not existed`,
        })
    }

    const motor = await motorService.updateMotorById(id, req.body);
    return res.status(200).json({
        status: true,
        message: "Motor updated successfully",
        data: motor
    })
};

// Delete Motor By Id
const deleteMotorByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
        })
    }

    const existedMotor = await motorService.findMotorById(id);
    if (!existedMotor) {
        return res.status(404).json({
            status: false,
            message: `Motor '${id}' does not existed`,
        })
    }

    const motor = await motorService.deleteMotorById(id);
    if (!motor) {
        return res.status(404).json({
            status: false,
            message: `Motor '${id}' does not existed`,
        })
    }
    return res.status(200).json({
        status: true,
        message: "Motor was deleted successfully",
        data: {}
    })
};

// Get Motor By Id
const getMotorByIdHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Id is required",
        })
    }

    const motor = await motorService.findMotorById(id);
    if (!motor) {
        return res.status(404).json({
            status: false,
            message: `Motor '${id}' does not existed`,
        })
    }
    return res.status(200).json({
        status: true,
        message: "Success",
        data: motor
    })
};

// Get All Motors
const getAllMotorsHandler = async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let motors = [];
    motors = await motorService.findMotors({ offset, limit: parseInt(limit) });
    return res.status(200).json({
        status: true,
        message: "Success",
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