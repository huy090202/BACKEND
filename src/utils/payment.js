const PAYMENT_METHOD_CODE = {
    COD: "COD", // Thanh toán khi nhận hàng
    STRIPE: "STRIPE", // STRIPE
    VIETQR: "VIETQR", // VIETQR
}

const PAYMENT_METHOD_KEYS = Object.keys(PAYMENT_METHOD_CODE);

const PAYMENT_STATUS_CODE = {
    PAID: "PAID", // Đã thanh toán
    UNPAID: "UNPAID" // Chưa thanh toán
}

module.exports = {
    PAYMENT_METHOD_CODE,
    PAYMENT_STATUS_CODE,

    PAYMENT_METHOD_KEYS
};