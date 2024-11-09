const db = require("../models/index");

// Tạo đơn hàng
const createOrder = async (data) => {
    const order = await db.Order.create(data);
    return order;
};

// Tìm đơn hàng theo order_code
const findOrderByOrderCode = async (orderCode) => {
    const order = await db.Order.findOne({
        where: { order_code: orderCode }
    });
    return order;
};

// Xóa đơn hàng theo order_code
const deleteOrderByOrderCode = async (orderCode) => {
    const order = await db.Order.destroy({
        where: orderCode
    });
    return order;
}

// Hiển thị thông tin đơn hàng theo order_code
const findAllOrderByOrderCode = async (code) => {
    const order = await db.Order.findAll({
        where: { order_code: code }
    });
    return order;
}

// Hiển thị thông tin đơn hàng theo số điện thoại
const findAllOrderByPhone = async (code) => {
    const order = await db.Order.findAll({
        where: { phone: code }
    });
    return order;
};

module.exports = {
    createOrder,
    findOrderByOrderCode,
    deleteOrderByOrderCode,
    findAllOrderByOrderCode,
    findAllOrderByPhone
};