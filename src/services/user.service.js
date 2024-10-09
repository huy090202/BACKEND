const { omit } = require('lodash');
const bcrypt = require("bcrypt");
const db = require('../models/index');
const { ROLE_CODE } = require('../utils/roles');

// Tạo một người dùng mới
const createUser = async ({ firstName, lastName, email, phoneNumber, password }) => {
    try {
        const hash = bcrypt.hashSync(password, 10);

        const newUser = await db.User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNumber: phoneNumber,
            password: hash,
            role: ROLE_CODE.USER
        });
        return omit(newUser.toJSON(), ["role", "password", "createdAt", "updatedAt"]);
    } catch (error) {
        console.error('Lỗi trong việc tạo tài khoản:', error);
        throw new Error('Có lỗi xảy ra khi tạo tài khoản');
    }
};

// Cập nhật thông tin người dùng theo id
const updateUser = async (id, dataUpdate) => {
    try {
        const user = await db.User.findOne({ where: { id } });
        if (!user) return null;

        await user.update(dataUpdate);
        return omit(user?.toJSON(), ["password", "createdAt", "updatedAt"]);
    } catch (error) {
        console.error('Lỗi trong khi cập nhật thông tin tài khoản:', error);
        throw new Error('Có lỗi xảy ra khi cập nhật thông tin tài khoản');
    }
};

// Thay đổi mật khẩu
const changePassword = async ({ id, currentPassword, newPassword }) => {
    try {
        const user = await db.User.findOne({ where: { id } });
        if (!user) return {
            statusCode: 404,
            status: false,
            message: "Tài khoản không tồn tại."
        }

        const isValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isValid) return {
            statusCode: 400,
            status: false,
            message: "Mật khẩu hiện tại không chính xác."
        }

        const hash = bcrypt.hashSync(newPassword, 10);
        await user.update({ password: hash }, { new: true });
        return {
            statusCode: 200,
            status: true,
            message: "Đổi mật khẩu thành công!"
        }
    } catch (error) {
        console.error('Lỗi trong việc thay đổi mật khẩu:', error);
        throw new Error('Có lỗi xảy ra khi thay đổi mật khẩu');
    }
};

// Lấy thông tin người dùng
const getUserProfile = async (id) => {
    const user = await db.User.findOne({ where: { id } });
    return omit(user.toJSON(), ["password", "createdAt", "updatedAt"]);
};

// Kiểm tra mật khẩu
const validatePassword = async ({ email, password }) => {
    try {
        // console.log('Email:', email);
        const user = await db.User.findOne({ where: { email } });
        if (!user) return false;

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return false;
        return omit(user?.toJSON(), ["role", "password", "createdAt", "updatedAt"]);
    } catch (error) {
        console.error('Lỗi trong việc kiểm tra mật khẩu:', error);
        throw new Error('Có lỗi xảy ra khi kiểm tra mật khẩu');
    }
};

// Lấy người dùng theo email
const getUserByEmail = async (email) => {
    try {
        const user = await db.User.findOne({ where: { email } });
        if (user) return omit(user?.toJSON(), ["role", "password", "createdAt", "updatedAt"]);
        return null;
    } catch (error) {
        console.error('Lỗi xảy ra khi tìm tài khoản theo email:', error);
        throw new Error('Có lỗi xảy ra khi tìm tài khoản theo email');
    }
};

// Lấy người dùng theo số điện thoại
const getUserByPhoneNumber = async (phoneNumber) => {
    try {
        const user = await db.User.findOne({ where: { phoneNumber } });
        if (user) return omit(user?.toJSON(), ["role", "password", "createdAt", "updatedAt"]);
        return null;
    } catch (error) {
        console.error('Lỗi xảy ra khi tìm người dùng theo số điện thoại:', error);
        throw new Error('Có lỗi xảy ra khi tìm người dùng theo số điện thoại');
    }
}

// Tạo một nhân viên mới
const createStaff = async ({ firstName, lastName, email, phoneNumber, password, role }) => {
    try {
        const hash = bcrypt.hashSync(password, 10);

        const newStaff = await db.User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNumber: phoneNumber,
            password: hash,
            role: role
        });
        return omit(newStaff.toJSON(), ["role", "password", "createdAt", "updatedAt"]);
    } catch (error) {
        console.error('Lỗi xảy ra khi tạo tài khoản nhân viên:', error);
        throw new Error('Có lỗi xảy ra khi tạo tài khoản nhân viên');
    }
}

// Lấy danh sách người dùng
const findUsers = async ({ query, active, offset, limit }) => {
    try {
        const { rows: users, count } = await db.User.findAndCountAll({ where: { ...query, ...active }, offset, limit });

        const formattedUsers = users.map(user => {
            return omit(user.toJSON(), ["password", "createdAt", "updatedAt"]);
        })

        return { users: formattedUsers, total: count };
    } catch (error) {
        console.error('Lỗi trong việc lấy ra danh sách người dùng:', error);
        throw new Error('Có lỗi xảy ra khi lấy ra danh sách người dùng');
    }
}

module.exports = {
    createUser,
    updateUser,
    changePassword,
    validatePassword,
    getUserByEmail,
    getUserByPhoneNumber,
    getUserProfile,
    createStaff,
    findUsers
};