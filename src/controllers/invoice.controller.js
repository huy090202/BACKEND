const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");
const ShortUniqueId = require('short-unique-id');
const invoiceService = require('../services/invoice.service');
const maintenanceService = require('../services/maintenance.service');
const { PAYMENT_STATUS_CODE, PAYMENT_METHOD_CODE } = require('../utils/payment');
const zalopayConfig = require("../configs/zalopayConfig");
const { checkPaymentStatusHandler } = require("./order.controller");
const { config } = require('dotenv');

config();

// Tạo hóa đơn
const createInvoiceHandler = async (req, res) => {
    try {
        const { invoices_code, total_amount, payment_status, payment_method, create_at, maintenance_id } = req.body;
        if (!total_amount || !maintenance_id) {
            return res.status(400).json({
                status: false,
                message: 'Các trường bắt buộc không được để trống',
                data: {}
            })
        }

        const existedMaintenance = await maintenanceService.findMaintenanceById(maintenance_id);
        if (!existedMaintenance) {
            return res.status(400).json({
                status: false,
                message: 'Bảo dưỡng không tồn tại',
                data: {}
            })
        }

        const uidGenerator = new ShortUniqueId({ length: 6 });
        const invoiceCode = uidGenerator.randomUUID();
        const existedInvoice = await invoiceService.findInvoiceByInvoiceCode(invoiceCode);
        if (existedInvoice) {
            return res.status(400).json({
                status: false,
                message: 'Mã hóa đơn đã tồn tại',
                data: {}
            })
        }

        let custom_invoice = {
            invoices_code: invoiceCode,
            total_amount: total_amount,
            payment_status: payment_status ? payment_status : PAYMENT_STATUS_CODE['PAID'],
            payment_method: payment_method ? payment_method : PAYMENT_METHOD_CODE['COD'],
            maintenance_id: maintenance_id,
            create_at: ''
        }

        if (payment_method === PAYMENT_METHOD_CODE['COD']) {
            const newInvoice = await invoiceService.createInvoice(custom_invoice);
            if (!newInvoice) {
                return res.status(400).json({
                    status: false,
                    message: 'Tạo hóa đơn không thành công',
                    data: {}
                })
            }

            const createdAt = newInvoice?.createdAt;
            let create_at = createdAt.toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh'
            }, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            });

            newInvoice.create_at = create_at;
            await newInvoice.save();

            return res.status(201).json({
                status: true,
                message: 'Tạo hóa đơn thành công',
                data: newInvoice
            })
        }

        // Xử lý thanh toán qua cổng thanh toán
        const paymentResult = await paymentHandler(custom_invoice);

        if (paymentResult && paymentResult.order_url) {
            return res.status(200).json({
                status: true,
                message: 'Đang được chuyển hướng đến trang thanh toán',
                data: paymentResult.order_url
            })
        } else {
            return res.status(500).json({
                status: false,
                message: 'Đã có lỗi xảy ra khi tạo hóa đơn thanh toán trực tuyến',
                data: {}
            })
        }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: false,
            message: "Đã có lỗi xảy ra",
            data: {}
        })
    }
}

// Xử lý thanh toán qua cổng thanh toán
const paymentHandler = async (invoice) => {
    try {
        const items = [
            {
                code: invoice.invoices_code,
                itemprice: Number(invoice.total_amount),
            }
        ];

        const embed_data = {
            redirecturl: `${process.env.URL_REACT}/` || 'http://localhost:3000/',
            invoices_code: invoice.invoices_code,
            total_amount: Number(invoice.total_amount),
            payment_method: invoice.payment_method,
            payment_status: invoice.payment_status,
            create_at: invoice.create_at,
            maintenance_id: invoice.maintenance_id,
        }

        const transID = Math.floor(Math.random() * 1000000);

        const paymentInvoice = {
            app_id: zalopayConfig.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
            app_user: invoice.invoices_code,
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: invoice.total_amount,
            description: `Thanh toán đơn hàng ${invoice.invoices_code}`,
            callback_url: `${process.env.URL_NGROK}/api/v1/invoice/callback`,
        }

        const data = [
            zalopayConfig.app_id,
            paymentInvoice.app_trans_id,
            paymentInvoice.app_user,
            paymentInvoice.amount,
            paymentInvoice.app_time,
            paymentInvoice.embed_data,
            paymentInvoice.item,
        ].join('|');

        paymentInvoice.mac = CryptoJS.HmacSHA256(data, zalopayConfig.key1).toString();

        const result = await axios.post(zalopayConfig.endpoint, null, {
            params: paymentInvoice,
        })

        console.log('Response from ZaloPay:', result.data);
        return result.data;
    } catch (error) {
        console.log('Đã có lỗi xảy ra', error.message);
        return null;
    }
};

// Xử lý callback từ cổng thanh toán
const callbackInvoiceHandler = async (req, res) => {
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
        console.log(checkStatus.return_code);
        if (checkStatus.return_code === 1) {
            const embedData = JSON.parse(dataJson.embed_data);

            let custom_invoice = {
                invoices_code: embedData.invoices_code,
                total_amount: embedData.total_amount,
                payment_status: PAYMENT_STATUS_CODE['PAID'],
                payment_method: PAYMENT_METHOD_CODE[embedData.payment_method],
                maintenance_id: embedData.maintenance_id,
                create_at: ''
            }

            const newInvoice = await invoiceService.createInvoice(custom_invoice);

            const createdAt = newInvoice?.createdAt;
            const create_at = createdAt.toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh'
            }, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            });

            newInvoice.create_at = create_at;
            await newInvoice.save();

            result = {
                return_code: 1,
                return_message: 'Hóa đơn đã được xác nhận và thanh toán thành công',
                order_id: newInvoice.id,
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
const checkStatusPaymentHandler = async (req, res) => {
    try {
        const { app_trans_id } = req.params;
        const checkStatus = await checkPaymentStatusHandler(req, res, app_trans_id);
        return res.status(200).json({
            status: true,
            message: checkStatus.return_message,
            data: checkStatus,
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            status: false,
            message: "Đã có lỗi xảy ra",
            data: {}
        })
    }
};

// Xoá hóa đơn
const deleteInvoiceHandler = async (req, res) => {
    const { code } = req.params;

    if (!code) {
        return res.status(400).json({
            status: false,
            message: 'Mã hóa đơn không được để trống',
            data: {}
        })
    }

    try {
        await invoiceService.deleteInvoiceByInvoiceCode({ invoices_code: code });
        return res.status(200).json({
            status: true,
            message: 'Xoá hóa đơn thành công',
            data: {}
        })
    } catch (error) {
        console.error('Đã có lỗi xảy ra khi xóa hóa đơn', error.message);
        return res.status(500).json({
            status: false,
            message: "Đã có lỗi xảy ra khi xoá hóa đơn",
            data: {}
        })
    }
};

// Hiển thị tất cả hóa đơn
const allInvoicesHandler = async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    try {
        const invoices = await invoiceService.findAllInvoices({ offset, limit: parseInt(limit) });

        if (!invoices) {
            return res.status(404).json({
                status: false,
                message: "Không tìm thấy hóa đơn",
                data: {}
            })
        }

        return res.status(200).json({
            status: true,
            message: "Hiển thị tất cả hóa đơn thành công",
            data: invoices.rows.map((invoice) => ({
                id: invoice.id,
                invoices_code: invoice.invoices_code,
                total_amount: invoice.total_amount,
                payment_status: invoice.payment_status,
                payment_method: invoice.payment_method,
                create_at: invoice.create_at,
                maintenance_id: invoice.maintenance_id,
                maintenance: invoice.maintenance
            })),
            total: invoices.count,
            page: parseInt(page),
            limit: parseInt(limit),
        })
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Đã có lỗi xảy ra khi hiển thị tất cả hóa đơn",
            data: {}
        })
    }
};

module.exports = {
    createInvoiceHandler,
    callbackInvoiceHandler,
    checkStatusPaymentHandler,
    deleteInvoiceHandler,
    allInvoicesHandler
}