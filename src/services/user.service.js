const { omit } = require('lodash');
const bcrypt = require("bcrypt");
const db = require('../models/index');
const { ROLE_CODE } = require('../utils/roles');

// User Registration
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
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
    }
};

// User Update
const updateUser = async (id, dataUpdate) => {
    try {
        const user = await db.User.findOne({ where: { id } });
        if (!user) return null;

        await user.update(dataUpdate);
        return omit(user?.toJSON(), ["password", "createdAt", "updatedAt"]);
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user');
    }
};

// Change Password
const changePassword = async ({ id, currentPassword, newPassword }) => {
    try {
        const user = await db.User.findOne({ where: { id } });
        if (!user) return {
            statusCode: 404,
            status: false,
            message: "User not found"
        }

        const isValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isValid) return {
            statusCode: 400,
            status: false,
            message: "Password did not match."
        }

        const hash = bcrypt.hashSync(newPassword, 10);
        await user.update({ password: hash }, { new: true });
        return {
            statusCode: 200,
            status: true,
            message: "Password was updated successfully!"
        }
    } catch (error) {
        console.error('Error changing password:', error);
        throw new Error('Failed to change password');
    }
};

// Get User Profile
const getUserProfile = async (id) => {
    const user = await db.User.findOne({ where: { id } });
    return omit(user.toJSON(), ["password", "createdAt", "updatedAt"]);
};

// Validate Password
const validatePassword = async ({ email, password }) => {
    try {
        // console.log('Email:', email);
        const user = await db.User.findOne({ where: { email } });
        if (!user) return false;

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return false;
        return omit(user?.toJSON(), ["role", "password", "createdAt", "updatedAt"]);
    } catch (error) {
        console.error('Error comparing password:', error);
        throw new Error('Failed to compare password');
    }
};

// Get User By Email
const getUserByEmail = async (email) => {
    try {
        const user = await db.User.findOne({ where: { email } });
        if (user) return omit(user?.toJSON(), ["role", "password", "createdAt", "updatedAt"]);
        return null;
    } catch (error) {
        console.error('Error retrieving user by email:', error);
        throw new Error('Failed to retrieve user by email');
    }
};

// Get User By Phone Number
const getUserByPhoneNumber = async (phoneNumber) => {
    try {
        const user = await db.User.findOne({ where: { phoneNumber } });
        if (user) return omit(user?.toJSON(), ["role", "password", "createdAt", "updatedAt"]);
        return null;
    } catch (error) {
        console.error('Error retrieving user by phone number:', error);
        throw new Error('Failed to retrieve user by phone number');
    }
}

// Create Staff
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
        console.error('Error creating staff:', error);
        throw new Error('Failed to create staff');
    }
}

// Find Users
const findUsers = async ({ query, active, offset, limit }) => {
    try {
        const { rows: users, count } = await db.User.findAndCountAll({ where: { ...query, ...active }, offset, limit });

        const formattedUsers = users.map(user => {
            return omit(user.toJSON(), ["password", "createdAt", "updatedAt"]);
        })

        return { users: formattedUsers, total: count };
    } catch (error) {
        console.error('Error finding users:', error);
        throw new Error('Failed to find users');
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