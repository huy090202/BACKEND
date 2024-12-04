const db = require("../models/index");

// Tạo hóa đơn
const createInvoice = async (data) => {
    const invoice = await db.Invoice.create(data);
    return invoice;
};

// Tìm hóa đơn theo invoices_code
const findInvoiceByInvoiceCode = async (invoiceCode) => {
    const invoice = await db.Invoice.findOne({
        where: { invoices_code: invoiceCode }
    });
    return invoice;
};

// Xóa hóa đơn theo invoices_code
const deleteInvoiceByInvoiceCode = async (invoiceCode) => {
    const invoice = await db.Invoice.destroy({
        where: invoiceCode
    });
    return invoice;
}

// Hiển thị danh sách hóa đơn
const findAllInvoices = async ({ offset, limit }) => {
    const totalInvoices = await db.Invoice.count();

    const invoices = await db.Invoice.findAll({
        offset,
        limit,
        include: [
            {
                model: db.Maintenance,
                as: 'maintenance',
                include: [
                    {
                        model: db.User,
                        as: 'user',
                    },
                    {
                        model: db.MaintenanceDetail,
                        as: 'maintenanceDetails',
                        include: [
                            {
                                model: db.MotorcycleParts,
                                as: 'part'
                            }
                        ]
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']],
    });

    return {
        rows: invoices,
        count: totalInvoices,
    }
}

module.exports = {
    createInvoice,
    findInvoiceByInvoiceCode,
    deleteInvoiceByInvoiceCode,
    findAllInvoices
};