const ORDER_STATUS_CODE = {
    PENDING: "PENDING", // Chờ xác nhận
    CONFIRMED: "CONFIRMED", // Đã xác nhận
    PREPARING: "PREPARING", // Đang chuẩn bị
    SHIPPING: "SHIPPING", // Đang giao hàng
    DELIVERED: "DELIVERED", // Đã giao hàng
    CANCELED: "CANCELED", // Đã hủy
    INVALID: "INVALID", // Đơn hàng không hợp lệ
    FAILED: "FAILED" // Đơn hàng thất bại
}

const ORDER_STATUS_KEYS = Object.keys(ORDER_STATUS_CODE);

const DELIVERY_METHOD_CODE = {
    DELIVERY: "DELIVERY", // Giao hàng
    CARRYOUT: "CARRYOUT" // Mang về
}

module.exports = {
    ORDER_STATUS_CODE,
    DELIVERY_METHOD_CODE,

    ORDER_STATUS_KEYS
}