const userServices = require('../services/user.service');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../services/jwt.service');
const { PASSWORD_VALIDATION, EMAIL_VALIDATION, PHONE_NUMBER_VALIDATION } = require('../utils/validations');
const { ROLE_CODE } = require('../utils/roles');

// User Registration
const createUserHandler = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
        return res.status(400).json({
            message: "Missing required information"
        });
    }

    if (!password.match(PASSWORD_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Password must contain at least one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character and it must be 8-16 characters long.",
            data: {}
        })
    }

    if (!email.match(EMAIL_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Invalid email format",
            data: {}
        })
    }

    if (!phoneNumber.match(PHONE_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Phone number must be 10 digits long",
            data: {}
        })
    }

    const checkUser = await userServices.getUserByEmail(email);
    if (checkUser) {
        return res.status(409).json({
            status: false,
            message: "Email already exists",
            data: {}
        })
    }

    const checkPhoneNumber = await userServices.getUserByPhoneNumber(phoneNumber);
    if (checkPhoneNumber) {
        return res.status(409).json({
            status: false,
            message: "Phone number already exists",
            data: {}
        })
    }

    const newUser = await userServices.createUser({ firstName, lastName, email, phoneNumber, password, role: ROLE_CODE.USER });
    return res.status(201).json({
        status: newUser ? true : false,
        message: newUser ? "User created successfully." : "Something went wrong, please try again!",
        data: {}
    })
};

// User Login
const loginUserHandler = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Missing required information"
        });
    }

    if (!email.match(EMAIL_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Invalid email format",
            data: {}
        })
    }

    // Check if user exists
    const user = await userServices.getUserByEmail(email);
    if (!user) {
        return res.status(404).json({
            status: false,
            message: "User not found",
            data: {}
        })
    }

    // Check if password is valid
    const isPasswordValid = await userServices.validatePassword({ email, password });
    if (!isPasswordValid) {
        return res.status(401).json({
            status: false,
            message: "Invalid password",
            data: {}
        })
    }

    // Make sure that user is not blocked
    if (!user.active) {
        return res.status(401).json({
            status: false,
            message: "You are blocked caused by some bad behaviours, please contact us if you think it is a mistake.",
            data: {}
        })
    }

    // Create access token and refresh token
    const access_token = await generateAccessToken({ id: user.id, role: user.role });
    const refresh_token = await generateRefreshToken({ id: user.id, role: user.role });

    // Set refresh token in cookie
    res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expires in 7 days
    })

    return res.status(200).json({
        status: true,
        message: "Login successful",
        data: {
            name: user.lastName + ' ' + user.firstName,
            email: user.email,
            access_token
        }
    })
};

// User Update
const updateUserHandler = async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Nothing was updated",
            data: {}
        });
    }

    const { avatar, firstName, lastName, phoneNumber, gender, address } = req.body;
    const user = await userServices.updateUser(id, {
        avatar,
        firstName,
        lastName,
        phoneNumber,
        gender,
        address
    });

    if (!user) {
        return res.status(400).json({
            status: false,
            message: "User does not exist.",
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: "Your information was updated.",
        data: user
    })
};

// Change Password
const changePasswordHandler = async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Nothing was updated",
            data: {}
        });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            status: false,
            message: "Missing required information",
            data: {}
        });
    }

    if (!currentPassword.match(PASSWORD_VALIDATION) || !newPassword.match(PASSWORD_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Password must contain at least one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character and it must be 8-16 characters long.",
            data: {}
        })
    }

    const result = await userServices.changePassword({ id, currentPassword, newPassword });
    return res.status(result.statusCode).json({
        status: result.status,
        message: result.message,
        data: {}
    });
};

// Get User Profile
const getUserProfileHandler = async (req, res) => {
    const { id } = req.user;
    const user = await userServices.getUserProfile(id);
    if (!user) {
        return res.status(400).json({
            status: false,
            message: "User not found!",
            data: {}
        });
    }
    return res.status(200).json({
        status: true,
        message: "User found!",
        data: user
    });
};

// Create Staff
const createStaffHandler = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password, role } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !role) {
        return res.status(400).json({
            status: false,
            message: "Missing user information",
            data: {}
        });
    }

    if (!password.match(PASSWORD_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Password must contain at least one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character and it must be 8-16 characters long.",
            data: {}
        })
    }

    if (!phoneNumber.match(PHONE_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Phone number must be 10 digits long",
            data: {}
        })
    }

    if (!email.match(EMAIL_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Invalid email format",
            data: {}
        })
    }

    const staff = await userServices.getUserByEmail(email);
    if (staff) {
        return res.status(409).json({
            status: false,
            message: "Email already exists",
            data: {}
        })
    }

    let controllerRole = 'STAFF';
    if (role === 'STAFF') controllerRole = 'STAFF';
    if (role === 'TECH') controllerRole = 'TECH';
    if (role === 'CASHIER') controllerRole = 'CASHIER';
    if (role === 'ADMIN') controllerRole = 'ADMIN';

    const newStaff = await userServices.createStaff({ firstName, lastName, email, phoneNumber, password, role: controllerRole });
    return res.status(201).json({
        status: newStaff ? true : false,
        message: newStaff ? "Staff created successfully." : "Something went wrong, please try again!",
        data: newStaff
    })
}

// Update User Status
const updateUserStatusHandler = async (req, res) => {
    const { id } = req.params;
    const { active } = req.body;
    let activeVar = true;
    if (active === 'false' || active === false) activeVar = false;
    await userServices.updateUser(id, { active: activeVar });
    return res.status(200).json({
        status: true,
        message: activeVar ? "User was active successfully" : "User was inactive successfully"
    })
};

// Get All Users
const getAllUsersHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let users = [];
    if (active === 'true' || active === true)
        users = await userServices.findUsers({ role: ROLE_CODE.USER, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        users = await userServices.findUsers({ role: ROLE_CODE.USER, active: { active: false }, offset, limit: parseInt(limit) });
    else users = await userServices.findUsers({ role: ROLE_CODE.USER, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "All users",
        data: users,
        total: users.length,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Get All Staffs
const getAllStaffsHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let staffs = [];
    if (active === 'true' || active === true)
        staffs = await userServices.findUsers({ role: ROLE_CODE.STAFF, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        staffs = await userServices.findUsers({ role: ROLE_CODE.STAFF, active: { active: false }, offset, limit: parseInt(limit) });
    else staffs = await userServices.findUsers({ role: ROLE_CODE.STAFF, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "All staffs",
        data: staffs,
        total: staffs.length,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Get All Techs
const getAllTechsHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let techs = [];
    if (active === 'true' || active === true)
        techs = await userServices.findUsers({ role: ROLE_CODE.TECH, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        techs = await userServices.findUsers({ role: ROLE_CODE.TECH, active: { active: false }, offset, limit: parseInt(limit) });
    else techs = await userServices.findUsers({ role: ROLE_CODE.TECH, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "All Techs",
        data: techs,
        total: techs.length,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Get All Cashiers
const getAllCashiersHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let cashiers = [];
    if (active === 'true' || active === true)
        cashiers = await userServices.findUsers({ role: ROLE_CODE.CASHIER, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        cashiers = await userServices.findUsers({ role: ROLE_CODE.CASHIER, active: { active: false }, offset, limit: parseInt(limit) });
    else cashiers = await userServices.findUsers({ role: ROLE_CODE.CASHIER, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "All Cashiers",
        data: cashiers,
        total: cashiers.length,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Get All Admins
const getAllAdminsHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let admins = [];
    if (active === 'true' || active === true)
        admins = await userServices.findUsers({ role: ROLE_CODE.ADMIN, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        admins = await userServices.findUsers({ role: ROLE_CODE.ADMIN, active: { active: false }, offset, limit: parseInt(limit) });
    else admins = await userServices.findUsers({ role: ROLE_CODE.ADMIN, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "All admins",
        data: admins,
        total: admins.length,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Refresh Token
const refreshTokenHandler = async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(401).json({
            status: false,
            message: "No refresh token provided",
            data: {}
        });
    }

    const response = await verifyToken(refresh_token);
    return res.status(200).json({
        status: response.status,
        message: response.message,
        data: response.access_token
    })
}

module.exports = {
    createUserHandler,
    loginUserHandler,
    updateUserHandler,
    changePasswordHandler,
    getUserProfileHandler,
    refreshTokenHandler,

    createStaffHandler,
    updateUserStatusHandler,

    getAllUsersHandler,
    getAllStaffsHandler,
    getAllTechsHandler,
    getAllCashiersHandler,
    getAllAdminsHandler
};