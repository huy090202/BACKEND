const userServices = require('../services/user.service');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../services/jwt.service');
const { PASSWORD_VALIDATION, EMAIL_VALIDATION, PHONE_NUMBER_VALIDATION } = require('../utils/validations');
const { ROLE_CODE } = require('../utils/roles');
const { uploadToMinio } = require('../middleware/uploadImages');
const minioClient = require('../configs/minio');

// Tạo một người dùng mới
const createUserHandler = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
        return res.status(400).json({
            message: "Các trường bắt buộc không được để trống"
        });
    }

    if (!password.match(PASSWORD_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Mật khẩu phải chứa ít nhất một chữ số từ 1 đến 9, một chữ thường, một chữ hoa, một ký tự đặc biệt và phải từ 8-16 ký tự.",
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

    if (!phoneNumber.match(PHONE_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Số điện thoại phải có 10 chữ số",
            data: {}
        })
    }

    const checkUser = await userServices.getUserByEmail(email);
    if (checkUser) {
        return res.status(409).json({
            status: false,
            message: "Email đã tồn tại",
            data: {}
        })
    }

    const checkPhoneNumber = await userServices.getUserByPhoneNumber(phoneNumber);
    if (checkPhoneNumber) {
        return res.status(409).json({
            status: false,
            message: "Số điện thoại đã tồn tại",
            data: {}
        })
    }

    const newUser = await userServices.createUser({ firstName, lastName, email, phoneNumber, password, role: ROLE_CODE['USER'] });
    return res.status(201).json({
        status: newUser ? true : false,
        message: newUser ? "Tài khoản được đăng ký thành công." : "Đã xảy ra lỗi, vui lòng thử lại!",
        data: {}
    })
};

// Đăng nhập
const loginUserHandler = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Thiếu thông tin đăng nhập"
        });
    }

    if (!email.match(EMAIL_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Định dạng email không hợp lệ",
            data: {}
        })
    }

    // Kiểm tra xem tài khoản người dùng có tồn tại không
    const user = await userServices.getUserByEmail(email);
    if (!user) {
        return res.status(404).json({
            status: false,
            message: "Tài khoản không tồn tại",
            data: {}
        })
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await userServices.validatePassword({ email, password });
    if (!isPasswordValid) {
        return res.status(401).json({
            status: false,
            message: "Mật khẩu không chính xác",
            data: {}
        })
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.active) {
        return res.status(401).json({
            status: false,
            message: "Tài khoản đã bị khóa. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết.",
            data: {}
        })
    }

    // Tạo access token và refresh token
    const access_token = await generateAccessToken({ id: user.id, role: user.role });
    const refresh_token = await generateRefreshToken({ id: user.id, role: user.role });

    // Lưu refresh token vào cookie
    res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie có hiệu lực trong 7 ngày
    })

    return res.status(200).json({
        status: true,
        message: "Đăng nhập thành công",
        data: {
            name: user.lastName + ' ' + user.firstName,
            email: user.email,
            access_token
        }
    })
};

// Cập nhật thông tin người dùng
const updateUserHandler = async (req, res) => {
    const { id, avatar } = req.user;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Không có gì được cập nhật",
            data: {}
        });
    }

    if (avatar && avatar !== "" && avatar !== null) {
        try {
            const fileName = avatar.split('/').pop(); // Lấy tên file từ url
            await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
        } catch (err) {
            console.error('Lỗi khi xóa ảnh cũ:', err);
            return res.status(500).json({
                status: false,
                message: "Ảnh đại diện không tồn tại",
                data: {}
            });
        }
    }

    let avatarUrl;
    if (req.file) {
        try {
            avatarUrl = await uploadToMinio(req.file);
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: "Lỗi khi tải ảnh lên",
                data: {}
            });
        }
    }

    const { firstName, lastName, phoneNumber, gender, address } = req.body;

    if (!firstName || !lastName || !phoneNumber) {
        return res.status(400).json({
            message: "Các trường bắt buộc không được để trống"
        });
    }

    if (!phoneNumber.match(PHONE_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Số điện thoại phải có 10 chữ số",
            data: {}
        })
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const phoneNumberCurrent = await userServices.getUserProfile(id);
    if (phoneNumber !== phoneNumberCurrent.phoneNumber) {
        const checkPhoneNumber = await userServices.getUserByPhoneNumber(phoneNumber);
        if (checkPhoneNumber) {
            return res.status(409).json({
                status: false,
                message: "Số điện thoại đã tồn tại",
                data: {}
            })
        }
    }

    const user = await userServices.updateUser(id, {
        ...(avatarUrl && { avatar: avatarUrl }),
        firstName,
        lastName,
        phoneNumber,
        gender,
        address
    });

    if (!user) {
        return res.status(400).json({
            status: false,
            message: "Cập nhật thông tin không thành công",
            data: {}
        });
    }

    return res.status(200).json({
        status: true,
        message: "Thông tin của bạn đã được cập nhật",
        data: user
    })
};

// Đổi mật khẩu
const changePasswordHandler = async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.status(400).json({
            status: false,
            message: "Không có gì được cập nhật",
            data: {}
        });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        });
    }

    if (!currentPassword.match(PASSWORD_VALIDATION) || !newPassword.match(PASSWORD_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Mật khẩu phải chứa ít nhất một chữ số từ 1 đến 9, một chữ thường, một chữ hoa, một ký tự đặc biệt và phải từ 8-16 ký tự.",
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

// Lấy thông tin người dùng
const getUserProfileHandler = async (req, res) => {
    const { id } = req.user;
    const user = await userServices.getUserProfile(id);
    if (!user) {
        return res.status(400).json({
            status: false,
            message: "Không tìm thấy người dùng",
            data: {}
        });
    }
    return res.status(200).json({
        status: true,
        message: "Lây thông tin người dùng thành công",
        data: user
    });
};

// Tạo một nhân viên mới
const createStaffHandler = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password, role } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !role) {
        return res.status(400).json({
            status: false,
            message: "Các trường bắt buộc không được để trống",
            data: {}
        });
    }

    if (!password.match(PASSWORD_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Mật khẩu phải chứa ít nhất một chữ số từ 1 đến 9, một chữ thường, một chữ hoa, một ký tự đặc biệt và phải từ 8-16 ký tự.",
            data: {}
        })
    }

    if (!phoneNumber.match(PHONE_NUMBER_VALIDATION)) {
        return res.status(400).json({
            status: false,
            message: "Số điện thoại phải có 10 chữ số",
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

    const staff = await userServices.getUserByEmail(email);
    if (staff) {
        return res.status(409).json({
            status: false,
            message: "Nhân viên đã tồn tại",
            data: {}
        })
    }

    let controllerRole = 'Nhân viên';
    if (role === 'Nhân viên') controllerRole = 'Nhân viên';
    if (role === 'Kỹ thuật viên') controllerRole = 'Kỹ thuật viên';
    if (role === 'Thu ngân') controllerRole = 'Thu ngân';
    if (role === 'Quản trị viên') controllerRole = 'Quản trị viên';

    const newStaff = await userServices.createStaff({ firstName, lastName, email, phoneNumber, password, role: controllerRole });
    return res.status(201).json({
        status: newStaff ? true : false,
        message: newStaff ? "Tài khoản nhân viên được tạo thành công." : "Đã xảy ra lỗi, vui lòng thử lại!",
        data: newStaff
    })
}

// Cập nhật trạng thái người dùng
const updateUserStatusHandler = async (req, res) => {
    const { id } = req.params;
    const { active } = req.body;
    let activeVar = true;
    if (active === 'false' || active === false) activeVar = false;
    await userServices.updateUser(id, { active: activeVar });
    return res.status(200).json({
        status: true,
        message: activeVar ? "Tài khoản đã được kích hoạt." : "Tài khoản đã bị vô hiệu hóa.",
    })
};

// Lấy tất cả người dùng
const getAllUsersHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let users = [];
    if (active === 'true' || active === true)
        users = await userServices.findUsers({ query: { role: ROLE_CODE.USER }, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        users = await userServices.findUsers({ query: { role: ROLE_CODE.USER }, active: { active: false }, offset, limit: parseInt(limit) });
    else users = await userServices.findUsers({ query: { role: ROLE_CODE.USER }, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "Lấy tất cả người dùng thành công",
        data: users.users,
        total: users.total,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Lấy tất cả nhân viên
const getAllStaffsHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let staffs = [];
    if (active === 'true' || active === true)
        staffs = await userServices.findUsers({ query: { role: ROLE_CODE.STAFF }, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        staffs = await userServices.findUsers({ query: { role: ROLE_CODE.STAFF }, active: { active: false }, offset, limit: parseInt(limit) });
    else staffs = await userServices.findUsers({ query: { role: ROLE_CODE.STAFF }, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "Lấy tất cả nhân viên thành công",
        data: staffs.users,
        total: staffs.total,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Lấy tất cả kỹ thuật viên
const getAllTechsHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let techs = [];
    if (active === 'true' || active === true)
        techs = await userServices.findUsers({ query: { role: ROLE_CODE.TECH }, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        techs = await userServices.findUsers({ query: { role: ROLE_CODE.TECH }, active: { active: false }, offset, limit: parseInt(limit) });
    else techs = await userServices.findUsers({ query: { role: ROLE_CODE.TECH }, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "Lấy tất cả kỹ thuật viên thành công",
        data: techs.users,
        total: techs.total,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Lấy tất cả nhân viên thu ngân
const getAllCashiersHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let cashiers = [];
    if (active === 'true' || active === true)
        cashiers = await userServices.findUsers({ query: { role: ROLE_CODE.CASHIER }, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        cashiers = await userServices.findUsers({ query: { role: ROLE_CODE.CASHIER }, active: { active: false }, offset, limit: parseInt(limit) });
    else cashiers = await userServices.findUsers({ query: { role: ROLE_CODE.CASHIER }, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "Lấy tất cả nhân viên thu ngân thành công",
        data: cashiers.users,
        total: cashiers.total,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Lấy tất cả admin
const getAllAdminsHandler = async (req, res) => {
    const { active, page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    let admins = [];
    if (active === 'true' || active === true)
        admins = await userServices.findUsers({ query: { role: ROLE_CODE.ADMIN }, active: { active: true }, offset, limit: parseInt(limit) });
    else if (active === 'false' || active === false)
        admins = await userServices.findUsers({ query: { role: ROLE_CODE.ADMIN }, active: { active: false }, offset, limit: parseInt(limit) });
    else admins = await userServices.findUsers({ query: { role: ROLE_CODE.ADMIN }, active: {}, offset, limit: parseInt(limit) });

    return res.status(200).json({
        status: true,
        message: "Lây tất cả admin thành công",
        data: admins.users,
        total: admins.total,
        page: parseInt(page),
        limit: parseInt(limit)
    });
};

// Cập nhật token mới
const refreshTokenHandler = async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(401).json({
            status: false,
            message: "Token không hợp lệ",
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