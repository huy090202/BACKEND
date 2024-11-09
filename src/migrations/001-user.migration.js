'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('Users', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4
            },
            avatar: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            firstName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            lastName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            phoneNumber: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isNumeric: true,
                },
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            gender: {
                type: Sequelize.ENUM('Nam', 'Nữ', 'Khác'),
                defaultValue: 'Khác',
            },
            address: {
                type: Sequelize.STRING,
            },
            active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            work_status: {
                type: Sequelize.ENUM('Đang làm việc', 'Đang rảnh'),
                defaultValue: 'Đang rảnh'
            },
            role: {
                type: Sequelize.ENUM('Khách hàng', 'Nhân viên', 'Kỹ thuật viên', 'Thu ngân', 'Quản trị viên'),
                defaultValue: 'Khách hàng',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        return await queryInterface.dropTable('Users');
    }
};