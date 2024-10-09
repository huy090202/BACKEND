const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateAccessToken = async (payload) => {
    const access_token = jwt.sign(
        {
            ...payload,
        },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: '1d',
        }
    );

    return access_token;
};

const generateRefreshToken = async (payload) => {
    const refresh_token = jwt.sign(
        {
            ...payload,
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn: '7d',
        }
    );

    return refresh_token;
};

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    resolve({
                        status: false,
                        message: "Token không hợp lệ",
                    });
                }

                const access_token = await generateAccessToken({
                    id: user?.id,
                    role: user?.role,
                });

                resolve({
                    status: true,
                    message: "Câp nhật token thành công",
                    access_token,
                });
            });
        } catch (error) {
            console.error('Lỗi trong việc kiểm tra token:', error);
            reject(error);
        }
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
};