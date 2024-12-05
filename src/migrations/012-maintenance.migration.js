'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('Maintenances', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4
            },
            status: {
                type: Sequelize.ENUM("Kiểm tra xe", "Đang bảo dưỡng", "Hoàn thành bảo dưỡng", "Đã hủy"),
                defaultValue: 'Kiểm tra xe',
                allowNull: false,
            },
            maintenance_code: {
                type: Sequelize.STRING(6),
                allowNull: false,
                unique: true
            },
            maintenance_date: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            notes_before: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            notes_after: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            wear_percentage_before: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            wear_percentage_after: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            motor_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Motors',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            appointment_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Appointments',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
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
        return queryInterface.dropTable('Maintenances');
    },
}