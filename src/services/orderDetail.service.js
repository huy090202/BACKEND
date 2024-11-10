const db = require("../models/index");

// Tạo chi tiết đơn hàng
const createOrderDetail = async (data) => {
    const orderDetail = await db.OrderDetail.create(data);
    return orderDetail;
};

module.exports = {
    createOrderDetail
};