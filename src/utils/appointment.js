const APPOINTMENT_STATUS_CODE = {
    PENDING: "PENDING", // Chờ xác nhận
    CONFIRMED: "CONFIRMED", // Đã xác nhận
    COMPLETED: "COMPLETED", // Đã hoàn thành
};

const APPOINTMENT_STATUS_KEYS = Object.keys(APPOINTMENT_STATUS_CODE);

module.exports = {
    APPOINTMENT_STATUS_CODE,
    APPOINTMENT_STATUS_KEYS
};