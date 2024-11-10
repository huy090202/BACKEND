const nodemailer = require("nodemailer");
const partService = require("../services/motorcycleparts.service");
const { config } = require('dotenv');

config();

const sendEmailCreateOrder = async (email, details) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_ACCOUNT,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    let listItem = "";
    for (const order of details) {
        const item = await partService.findMotorcyclepartsById(order.part_id);
        if (!item) {
            continue;
        }

        listItem += `<div style="margin-bottom: 10px;">
            <strong>Sản phẩm:</strong> ${item.part_name}<br>
            <strong>Số lượng:</strong> ${order.quantity}<br>
            <strong>Giá:</strong> ${order.total_price} VND
        </div>`;
    }

    let info = await transporter.sendMail({
        from: process.env.MAIL_ACCOUNT,
        to: email,
        subject: "Bạn đã đặt hàng tại cửa hàng bảo dưỡng xe máy HUYMOTORBIKE",
        text: "HUYMOTORBIKE xin chào bạn",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 5px;">
                    <h2 style="color: #333;">Cảm ơn bạn đã đặt hàng!</h2>
                    <p>Bạn đã đặt hàng thành công tại cửa hàng bảo dưỡng xe máy HUYMOTORBIKE.</p>
                    <h3 style="color: #333;">Thông tin đơn hàng:</h3>
                    ${listItem}
                    <p style="margin-top: 20px;">Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi qua email này.</p>
                    <footer style="margin-top: 20px; font-size: 12px; color: #777;">
                        <p>Trân trọng,<br>Cửa hàng bảo dưỡng xe máy HUYMOTORBIKE</p>
                    </footer>
                </div>
            </div>
        `,
    });
};

module.exports = {
    sendEmailCreateOrder,
};