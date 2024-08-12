'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Motor extends Model {
        static associate(models) {
            // A motor belongs to a user
            Motor.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
            });

            // A motor can have many motor images
            Motor.hasMany(models.MotorImage, {
                foreignKey: 'motor_id',
                as: 'motorImages',
            });
        }
    };

    Motor.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        motor_name: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('motor_name', value.trim());
            },
            get() {
                const rawValue = this.getDataValue('motor_name');
                return rawValue ? rawValue.trim() : null;
            }
        },
        motor_type: {
            type: DataTypes.ENUM('UNDERBONE', 'SCOOTER', 'MANUAL', 'BIGBIKE'), // Xe số, Xe ga, Xe côn, Xe phân khối lớn
            allowNull: false,
            defaultValue: 'UNDERBONE', // Xe số
        },
        motor_color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        license_plate: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        cavet: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_part: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        motor_model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Motor',
        tableName: 'Motors',
    });

    return Motor;
}