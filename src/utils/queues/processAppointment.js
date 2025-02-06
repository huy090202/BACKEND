module.exports = async (job) => {
    try {
        console.log(`Đang xử lý lịch bảo dưỡng: ${job.data.scheduleId}`);
        // Thực hiện logic xử lý đặt lịch ở đây
        // Ví dụ: Gửi thông báo xác nhận, kiểm tra lịch trống,...
    } catch (error) {
        console.error(`Lỗi khi xử lý lịch bảo dưỡng ${job.data.scheduleId}:`, error);
        throw error;
    }
};
