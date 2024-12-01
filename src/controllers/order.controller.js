const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");
const ShortUniqueId = require('short-unique-id');
const orderService = require('../services/order.service');
const orderDetailService = require('../services/orderDetail.service');
const partService = require('../services/motorcycleparts.service');
const stockService = require('../services/stock.service');
const emailService = require('../services/email.service');
const zalopayConfig = require('../configs/zalopayConfig');
const { EMAIL_VALIDATION, PHONE_NUMBER_VALIDATION, ORDER_CODE_VALIDATION } = require('../utils/validations');
const { ORDER_STATUS_CODE, DELIVERY_METHOD_CODE } = require('../utils/order');
const { PAYMENT_METHOD_CODE, PAYMENT_STATUS_CODE } = require('../utils/payment');
const { sequelize } = require('../models');
const { config } = require('dotenv');

config();

// Tạo đơn hàng
const createOrderHandler = async (req, res) => {
    try {
        const { name, email, phone, notes, order_code, total_quantity, total_price, order_date, order_status, payment_status, payment_method, delivery_method, user_id, details } = req.body;
        if (!name || !email || !phone || !total_quantity || !total_price || !details) {
            return res.status(400).json({
                status: false,
                message: 'Các trường bắt buộc không được để trống',
                data: {}
            });
        }

        if (!email.match(EMAIL_VALIDATION)) {
            return res.status(400).json({
                status: false,
                message: 'Email không hợp lệ',
                data: {}
            });
        }

        if (!phone.match(PHONE_NUMBER_VALIDATION)) {
            return res.status(400).json({
                status: false,
                message: 'Số điện thoại không hợp lệ',
                data: {}
            });
        }

        if (details.length === 0) {
            return res.status(400).json({
                status: false,
                message: 'Đơn hàng không có sản phẩm',
                data: {}
            });
        }

        const uidGenerator = new ShortUniqueId({ length: 6 });
        const orderCode = uidGenerator.randomUUID();
        const existedOrder = await orderService.findOrderByOrderCode(orderCode);
        if (existedOrder) {
            return res.status(400).json({
                status: false,
                message: 'Mã đơn hàng đã tồn tại',
                data: {}
            });
        }

        let custom_order = {
            name: name,
            email: email,
            phone: phone,
            notes: notes,
            total_quantity: total_quantity,
            total_price: total_price,
            order_status: ORDER_STATUS_CODE['PENDING'],
            payment_status: payment_status ? payment_status : PAYMENT_STATUS_CODE['UNPAID'],
            order_code: orderCode,
            user_id: req.user.id,
            delivery_method: delivery_method ? delivery_method : DELIVERY_METHOD_CODE['DELIVERY'],
            payment_method: payment_method ? payment_method : PAYMENT_METHOD_CODE['COD'],
            order_date: '',
        }

        // Thanh toán khi nhận hàng (dùng tiền mặt)
        if (payment_method === PAYMENT_METHOD_CODE['COD']) {
            const t = await sequelize.transaction();

            try {
                const newOrder = await orderService.createOrder(custom_order, {
                    transaction: t,
                });
                if (!newOrder) {
                    await t.rollback();
                    return res.status(500).json({
                        status: false,
                        message: 'Đã có lỗi xảy ra khi tạo đơn hàng',
                        data: {}
                    });
                }

                if (details && Array.isArray(details)) {
                    for (let item of details) {
                        const { quantity, price, total_price, part_id } = item;

                        if (!quantity || !price || !total_price || !part_id) {
                            await t.rollback();
                            return res.status(400).json({
                                status: false,
                                message: 'Chi tiết đơn hàng không hợp lệ',
                                data: {}
                            });
                        }

                        const existedPart = await partService.findMotorcyclepartsById(part_id);
                        if (!existedPart) {
                            await t.rollback();
                            return res.status(400).json({
                                status: false,
                                message: 'Sản phẩm không tồn tại',
                                data: {}
                            });
                        }

                        if (existedPart.stocks[0].quantity <= 0) {
                            await t.rollback();
                            return res.status(400).json({
                                status: false,
                                message: 'Sản phẩm đã hết hàng',
                                data: {}
                            });
                        }

                        if (existedPart.stocks[0].quantity < quantity) {
                            await t.rollback();
                            return res.status(400).json({
                                status: false,
                                message: 'Số lượng sản phẩm không đủ',
                                data: {}
                            });
                        }

                        if (price <= 0) {
                            await t.rollback();
                            return res.status(400).json({
                                status: false,
                                message: 'Giá sản phẩm không hợp lệ',
                                data: {}
                            });
                        }

                        if (quantity <= 0) {
                            await t.rollback();
                            return res.status(400).json({
                                status: false,
                                message: 'Số lượng sản phẩm phải lớn hơn 0',
                                data: {}
                            });
                        }

                        const newOrderDetail = await orderDetailService.createOrderDetail({
                            quantity,
                            price,
                            total_price,
                            order_id: newOrder.id,
                            part_id
                        }, {
                            transaction: t,
                        })

                        await stockService.updateStock({
                            part_id: part_id,
                            quantity: existedPart.stocks[0].quantity - newOrderDetail.quantity,
                            warehouse_id: existedPart.stocks[0].warehouse.id
                        }, {
                            transaction: t,
                        });
                    }
                }

                const createdAt = newOrder?.createdAt;
                let order_date = createdAt.toLocaleString('vi-VN', {
                    timeZone: 'Asia/Ho_Chi_Minh'
                }, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                });

                newOrder.order_date = order_date;
                await newOrder.save({ transaction: t });
                await emailService.sendEmailCreateOrder(email, details);
                await t.commit();

                return res.status(201).json({
                    status: true,
                    message: 'Tạo đơn hàng thành công',
                    data: {
                        ...newOrder.dataValues,
                        ...(details && {
                            details: details.map((item) => ({
                                quantity: item.quantity,
                                price: item.price,
                                total_price: item.total_price,
                                part_id: item.part_id
                            }))
                        })
                    }
                })
            } catch (error) {
                console.log('Đã có lỗi xảy ra', error);
                await t.rollback();
                return res.status(500).json({
                    status: false,
                    message: 'Đã có lỗi xảy ra',
                    data: {}
                });
            }
        }

        // Thanh toán trực tuyến với ZaloPay
        const paymentResult = await paymentHandler(custom_order, details);

        if (paymentResult && paymentResult.order_url) {
            return res.status(200).json({
                status: true,
                message: 'Đang được chuyển hướng đến trang thanh toán',
                data: paymentResult.order_url
            })
        } else {
            return res.status(500).json({
                status: false,
                message: 'Đã có lỗi xảy ra khi tạo đơn hàng thanh toán trực tuyến',
                data: {}
            });
        }
    } catch (error) {
        console.log('Đã có lỗi xảy ra', error);
        return res.status(500).json({
            status: false,
            message: 'Đã có lỗi xảy ra',
            data: {}
        });
    }
};

// Xử lý thanh toán
const paymentHandler = async (order, details) => {
    try {
        const items = await Promise.all(details.map(async (item) => {
            const part = await partService.findMotorcyclepartsById(item.part_id);
            return {
                item_id: item.part_id,
                item_price: item.price,
                item_quantity: item.quantity,
                item_name: part.part_name,
            };
        }));

        const embed_data = {
            redirecturl: `${process.env.URL_REACT}/menu` || 'http://localhost:3000/menu',
            order_code: order.order_code,
            name: order.name,
            email: order.email,
            phone: order.phone,
            notes: order.notes,
            total_price: order.total_price,
            total_quantity: order.total_quantity,
            order_status: order.order_status,
            payment_status: order.payment_status,
            payment_method: order.payment_method,
            delivery_method: order.delivery_method,
            order_date: order.order_date,
            user_id: order.user_id,
            details: details,
        }

        const transID = Math.floor(Math.random() * 1000000);

        const paymentOrder = {
            app_id: zalopayConfig.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
            app_user: order.email,
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: order.total_price,
            description: `Thanh toán đơn hàng ${order.order_code}`,
            callback_url: `${process.env.URL_NGROK}/api/v1/order/callback`,
        }

        const data = [
            zalopayConfig.app_id,
            paymentOrder.app_trans_id,
            paymentOrder.app_user,
            paymentOrder.amount,
            paymentOrder.app_time,
            paymentOrder.embed_data,
            paymentOrder.item,
        ].join('|');

        paymentOrder.mac = CryptoJS.HmacSHA256(data, zalopayConfig.key1).toString();

        const result = await axios.post(zalopayConfig.endpoint, null, {
            params: paymentOrder,
        })

        return result.data;
    } catch (error) {
        console.log('Đã có lỗi xảy ra', error.message);
        return null;
    }
};

// Xử lý callback từ ZaloPay
const callbackOrderHandler = async (req, res) => {
    let result = {};
    try {
        const dataStr = req.body.data;
        const reqMac = req.body.mac;

        const mac = CryptoJS.HmacSHA256(dataStr, zalopayConfig.key2).toString();

        if (reqMac !== mac) {
            return res.status(403).json({
                return_code: -1,
                return_message: 'MAC không hợp lệ',
            })
        }

        const dataJson = JSON.parse(dataStr);
        const { app_trans_id } = dataJson;

        const checkStatus = await checkPaymentStatusHandler(req, res, app_trans_id);

        if (checkStatus.return_code === 1) {
            const embedData = JSON.parse(dataJson.embed_data);

            const newOrderData = {
                name: embedData.name,
                email: embedData.email,
                phone: embedData.phone,
                notes: embedData.notes,
                total_quantity: embedData.total_quantity,
                total_price: embedData.total_price,
                order_status: ORDER_STATUS_CODE['PENDING'],
                payment_status: PAYMENT_STATUS_CODE['PAID'],
                order_code: embedData.order_code,
                user_id: embedData.user_id,
                delivery_method: DELIVERY_METHOD_CODE[embedData.delivery_method],
                payment_method: PAYMENT_METHOD_CODE[embedData.payment_method],
                order_date: '',
            }

            const newOrder = await orderService.createOrder(newOrderData);

            for (let item of embedData.details) {
                const existedPart = await partService.findMotorcyclepartsById(item.part_id);
                if (!existedPart) {
                    console.log("Sản phẩm không tồn tại khi xác nhận thanh toán trực tuyến:", item.part_id);
                    continue;
                }

                try {
                    const newOrderDetail = await orderDetailService.createOrderDetail({
                        quantity: item.quantity,
                        price: item.price,
                        total_price: item.total_price,
                        order_id: newOrder.id,
                        part_id: item.part_id
                    })

                    await stockService.updateStock({
                        part_id: item.part_id,
                        quantity: existedPart.stocks[0].quantity - newOrderDetail.quantity,
                        warehouse_id: existedPart.stocks[0].warehouse.id
                    });
                } catch (error) {
                    console.log("Đã có lỗi xảy ra khi xác nhận thanh toán trực tuyến:", error.message);
                    return;
                }
            }

            const createdAt = newOrder?.createdAt;
            let order_date = createdAt?.toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh'
            }, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            });

            newOrder.order_date = order_date;
            await newOrder.save();

            await emailService.sendEmailCreateOrder(embedData.email, embedData.details);

            result = {
                return_code: 1,
                return_message: 'Đơn hàng đã được xác nhận và thanh toán thành công',
                order_id: newOrder.id,
            }
        } else {
            result = {
                return_code: 0,
                return_message: 'Thanh toán thất bại hoặc đang chờ xử lý',
            }
        }
    } catch (error) {
        console.error('Đã có lỗi xảy ra khi thanh toán trực tuyến', error.message);
        result = {
            return_code: 0,
            return_message: 'Đã có lỗi xảy ra khi thanh toán trực tuyến',
        }
    }
};

// Kiểm tra trạng thái thanh toán
const checkPaymentStatusHandler = async (req, res, app_trans_id) => {
    const postData = {
        app_id: zalopayConfig.app_id,
        app_trans_id
    }

    const data = `${postData.app_id}|${postData.app_trans_id}|${zalopayConfig.key1}`;

    postData.mac = CryptoJS.HmacSHA256(data, zalopayConfig.key1).toString();

    const postConfigs = {
        method: 'post',
        url: process.env.CREATE_ZLP_ENDPOINT_QUERY,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify(postData),
    }

    try {
        const respone = await axios(postConfigs);
        return respone.data;
    } catch (error) {
        console.error('Đã có lỗi xảy ra khi kiểm tra trạng thái thanh toán', error.message);
        return null;
    }
};

// Xóa đơn hàng
const deleteOrderHandler = async (req, res) => {
    const { code } = req.params;
    if (!code) {
        return res.status(400).json({
            status: false,
            message: 'Mã đơn hàng không được để trống',
            data: {}
        });
    }

    try {
        await orderService.deleteOrderByOrderCode({ order_code: code });
        return res.status(200).json({
            status: true,
            message: 'Xóa đơn hàng thành công',
            data: {}
        });
    } catch (error) {
        console.error('Đã có lỗi xảy ra khi xóa đơn hàng', error.message);
        return res.status(500).json({
            status: false,
            message: 'Đã có lỗi xảy ra khi xóa đơn hàng',
            data: {}
        });
    }
};

// Tra cứu đơn hàng
const trackingOrderHandler = async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({
            status: false,
            message: 'Mã đơn hàng không được để trống',
            data: {}
        });
    }

    try {
        let order;
        if (code.match(ORDER_CODE_VALIDATION)) {
            order = await orderService.findAllOrderByOrderCode(code);
        } else if (code.match(PHONE_NUMBER_VALIDATION)) {
            order = await orderService.findAllOrderByPhone(code);
        } else {
            return res.status(400).json({
                status: false,
                message: 'Đơn hàng không tồn tại',
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Lấy thông tin đơn hàng thành công',
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Đã có lỗi xảy ra',
            data: {}
        });
    }
};

// Cập nhật trạng thái đơn hàng
const changeOrderStatusHandler = async (req, res) => {
    const { id } = req.params;
    const { status } = req.query;
    if (!id || !status) {
        return res.status(400).json({
            status: false,
            message: 'ID đơn hàng và trạng thái đơn hàng không được để trống',
            data: {}
        });
    }

    if (!Object.values(ORDER_STATUS_CODE).includes(status)) {
        return res.status(400).json({
            status: false,
            message: 'Trạng thái đơn hàng không hợp lệ',
            data: {}
        });
    }

    try {
        let order;
        if (status === ORDER_STATUS_CODE['DELIVERED']) {
            order = await orderService.updateOrderStatusById(id, {
                order_status: ORDER_STATUS_CODE['DELIVERED'],
                payment_status: PAYMENT_STATUS_CODE['PAID']
            });
        } else {
            order = await orderService.updateOrderStatusById(id, {
                order_status: status
            });
        }

        if (!order) {
            return res.status(400).json({
                status: false,
                message: 'Cập nhật trạng thái đơn hàng không thành công',
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: `Trạng thái đơn hàng đã được cập nhật thành ${status}`,
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Đã có lỗi xảy ra khi cập nhật trạng thái đơn hàng',
            data: {}
        });
    }
};

// Cập nhật trạng thái thanh toán
const changePaymentStatusHandler = async (req, res) => {
    const { orderCode } = req.params;
    const { status } = req.query;
    if (!orderCode || !status) {
        return res.status(400).json({
            status: false,
            message: 'Mã đơn hàng và trạng thái thanh toán không được để trống',
            data: {}
        });
    }

    if (!Object.values(PAYMENT_STATUS_CODE).includes(status)) {
        return res.status(400).json({
            status: false,
            message: 'Trạng thái thanh toán không hợp lệ',
            data: {}
        });
    }

    try {
        const order = await orderService.updateOrderPaymentStatusByCode(
            {
                order_code: orderCode,
            },
            {
                payment_status: status
            }
        )

        if (!order) {
            return res.status(400).json({
                status: false,
                message: 'Cập nhật trạng thái thanh toán không thành công',
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: `Trạng thái thanh toán đã được cập nhật thành ${status}`,
            data: {}
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Đã có lỗi xảy ra khi cập nhật trạng thái thanh toán',
            data: {}
        });
    }
};

// Lấy tất cả đơn hàng của 1 người dùng
const getAllOrdersHandler = async (req, res) => {
    const { id } = req.user;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    try {
        let orders = [];

        orders = await orderService.findAllOrdersByUserId(id, {
            offset,
            limit: parseInt(limit)
        })

        if (!orders) {
            return res.status(400).json({
                status: false,
                message: 'Không có đơn hàng nào',
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Lấy thông tin đơn hàng thành công',
            data: orders.rows.map((order) => ({
                id: order.id,
                order_code: order.order_code,
                total_price: order.total_price,
                total_quantity: order.total_quantity,
                order_status: order.order_status,
                payment_status: order.payment_status,
                payment_method: order.payment_method,
                delivery_method: order.delivery_method,
                order_date: order.order_date,
                user_id: order.user_id,
                name: order.name,
                email: order.email,
                phone: order.phone,
                notes: order.notes,
                details: order.orderDetails.map((detailItem) => ({
                    id: detailItem.id,
                    quantity: detailItem.quantity,
                    price: detailItem.price,
                    total_price: detailItem.price * detailItem.quantity,
                    part_id: detailItem.part_id,
                    part: {
                        part_name: detailItem.part.part_name,
                        part_price: detailItem.part.part_price,
                        sale: detailItem.part.sale,
                        average_life: detailItem.part.average_life,
                        description: detailItem.part.description,
                        part_image: detailItem.part.part_image,
                        category: detailItem.part.category.name,
                        manufacturer: detailItem.part.manufacturer.name,
                        stocks: detailItem.part.stocks.map(stock => ({
                            warehouse_name: stock.warehouse.name,
                            quantity: stock.quantity
                        }))
                    }
                }))
            })),
            total: orders.count,
            page: parseInt(page),
            limit: parseInt(limit),
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Đã có lỗi xảy ra',
            data: {}
        });
    }
};

// Lấy tất cả đơn hàng của hệ thống
const allOrdersHandler = async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    try {
        const orders = await orderService.findAllOrders({
            offset,
            limit: parseInt(limit)
        });

        if (!orders) {
            return res.status(400).json({
                status: false,
                message: 'Không có đơn hàng nào',
                data: {}
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Lấy thông tin đơn hàng thành công',
            data: orders.rows.map((order) => ({
                id: order.id,
                order_code: order.order_code,
                total_price: order.total_price,
                total_quantity: order.total_quantity,
                order_status: order.order_status,
                payment_status: order.payment_status,
                payment_method: order.payment_method,
                delivery_method: order.delivery_method,
                order_date: order.order_date,
                user_id: order.user_id,
                name: order.name,
                email: order.email,
                phone: order.phone,
                notes: order.notes,
                details: order.orderDetails.map((detailItem) => ({
                    id: detailItem.id,
                    quantity: detailItem.quantity,
                    price: detailItem.price,
                    total_price: detailItem.price * detailItem.quantity,
                    part_id: detailItem.part_id,
                    part: {
                        part_name: detailItem.part.part_name,
                        part_price: detailItem.part.part_price,
                        sale: detailItem.part.sale,
                        average_life: detailItem.part.average_life,
                        description: detailItem.part.description,
                        part_image: detailItem.part.part_image,
                        category: detailItem.part.category.name,
                        manufacturer: detailItem.part.manufacturer.name,
                        stocks: detailItem.part.stocks.map(stock => ({
                            warehouse_name: stock.warehouse.name,
                            quantity: stock.quantity
                        }))
                    }
                }))
            })),
            total: orders.count,
            page: parseInt(page),
            limit: parseInt(limit),
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Đã có lỗi xảy ra',
            data: {}
        });
    }
};

module.exports = {
    createOrderHandler,
    paymentHandler,
    callbackOrderHandler,
    checkPaymentStatusHandler,
    deleteOrderHandler,
    trackingOrderHandler,
    changeOrderStatusHandler,
    changePaymentStatusHandler,
    getAllOrdersHandler,
    allOrdersHandler
}