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

// Cập nhật trạng thái đơn hàng theo id
const updateOrderStatusById = async (id, status) => {
    const order = await db.Order.update(status, {
        where: { id }
    })
    return order;
};

// Cập nhật trạng thái thanh toán đơn hàng theo order_code
const updateOrderPaymentStatusByCode = async (code, status) => {
    const order = await db.Order.update(status, {
        where: code
    })
    return order;
};

// Tìm tất cả đơn hàng theo user_id
const findAllOrdersByUserId = async (id, { offset, limit }) => {
    const totalOrders = await db.Order.count({
        where: { user_id: id }
    })

    const orders = await db.Order.findAll({
        where: { user_id: id },
        offset,
        limit,
        include: [
            {
                model: db.OrderDetail,
                as: 'orderDetails',
                include: [
                    {
                        model: db.MotorcycleParts,
                        as: 'part',
                        include: [
                            {
                                model: db.Stock,
                                as: 'stocks',
                                include: [
                                    {
                                        model: db.Warehouse,
                                        as: 'warehouse',
                                        attributes: ['id', 'name', 'address']
                                    }
                                ],
                                attributes: ['id', 'quantity']
                            },
                            {
                                model: db.Category,
                                as: 'category',
                                attributes: ['id', 'name']
                            },
                            {
                                model: db.Manufacturer,
                                as: 'manufacturer',
                                attributes: ['id', 'name']
                            }
                        ],
                        attributes: ['id', 'part_name', 'part_price', 'sale', 'average_life', 'description', 'part_image']
                    }
                ],
                attributes: ['id', 'quantity', 'price', 'part_id'],
            },
        ]
    });

    return {
        rows: orders,
        count: totalOrders
    }
};

// Tìm tất cả đơn hàng của hệ thống
const findAllOrders = async ({ offset, limit }) => {
    const totalOrders = await db.Order.count();

    const orders = await db.Order.findAll({
        offset,
        limit,
        include: [
            {
                model: db.OrderDetail,
                as: 'orderDetails',
                include: [
                    {
                        model: db.MotorcycleParts,
                        as: 'part',
                        include: [
                            {
                                model: db.Stock,
                                as: 'stocks',
                                include: [
                                    {
                                        model: db.Warehouse,
                                        as: 'warehouse',
                                        attributes: ['id', 'name', 'address']
                                    }
                                ],
                                attributes: ['id', 'quantity']
                            },
                            {
                                model: db.Category,
                                as: 'category',
                                attributes: ['id', 'name']
                            },
                            {
                                model: db.Manufacturer,
                                as: 'manufacturer',
                                attributes: ['id', 'name']
                            }
                        ],
                        attributes: ['id', 'part_name', 'part_price', 'sale', 'average_life', 'description', 'part_image']
                    }
                ],
                attributes: ['id', 'quantity', 'price', 'part_id'],
            },
        ]
    });

    return {
        rows: orders,
        count: totalOrders
    }
};

module.exports = {
    createOrder,
    findOrderByOrderCode,
    deleteOrderByOrderCode,
    findAllOrderByOrderCode,
    findAllOrderByPhone,
    updateOrderStatusById,
    updateOrderPaymentStatusByCode,
    findAllOrdersByUserId,
    findAllOrders
};