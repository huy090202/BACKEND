module.exports = async (job) => {
    try {
        console.log(`Đang xử lý đơn hàng: ${job.data.orderId}`);
        // Thực hiện logic xử lý đơn hàng ở đây
        // Ví dụ: Lưu vào DB, gửi email xác nhận,...
    } catch (error) {
        console.error(`Lỗi khi xử lý đơn hàng ${job.data.orderId}:`, error);
        throw error;
    }
};
