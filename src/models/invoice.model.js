'use strict';

const { Model } = require('sequelize');

const { PAYMENT_STATUS_CODE, PAYMENT_METHOD_CODE, PAYMENT_METHOD_KEYS } = require('../utils/payment');

module.exports = (sequelize, DataTypes) => {
    class Invoice extends Model {
        static associate(models) {
            // 1 hóa đơn thuộc về 1 đơn bảo dưỡng
            Invoice.belongsTo(models.Maintenance, {
                foreignKey: 'maintenance_id',
                as: 'maintenance',
            });
        }
    };

    Invoice.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.ENUM(PAYMENT_STATUS_CODE['UNPAID'], PAYMENT_STATUS_CODE['PAID']),
            defaultValue: PAYMENT_STATUS_CODE['UNPAID'],
        },
        payment_method: {
            type: DataTypes.ENUM(...PAYMENT_METHOD_KEYS),
            defaultValue: PAYMENT_METHOD_CODE['COD'],
        },
        create_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        maintenance_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Invoice',
        tableName: 'Invoices',
    });

    return Invoice;
};