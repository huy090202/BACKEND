'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return await queryInterface.createTable('MotorcycleParts', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            part_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            part_price: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            part_image: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            manufacturer_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Manufacturers',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            category_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Categories',
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
        return await queryInterface.dropTable('MotorcycleParts');
    }
}