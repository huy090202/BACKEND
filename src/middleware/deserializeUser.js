const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const userServices = require('../services/user.service');
const { verifyToken } = require('../services/jwt.service');

dotenv.config();

const deserializeUser = async (req, res, next) => {
    const accessToken = req?.headers?.authorization;
    if (accessToken?.startsWith('Bearer ')) {
        const token = accessToken.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
            const user = await userServices.getUserProfile(decoded.id);
            if (!user) {
                return res.status(401).json({
                    status: false,
                    message: 'Người dùng không tồn tại!',
                    data: {}
                });
            }

            req.user = user;
            return next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                const refreshToken = req?.cookies?.refresh_token;
                if (!refreshToken) {
                    return res.status(401).json({
                        status: false,
                        message: 'Refesh token không tồn tại!',
                        data: {}
                    });
                }

                try {
                    // Kiểm tra refresh token
                    const verificationResult = await verifyToken(refreshToken);

                    if (verificationResult.status === 'OK') {
                        // Gửi lại access token mới
                        return res.json({
                            status: true,
                            message: 'Access token dự phòng đã được tạo!',
                            data: {
                                accessToken: verificationResult.access_token
                            }
                        });
                    } else {
                        // Xóa cookie refresh token nếu không hợp lệ
                        res.clearCookie('refresh_token', {
                            httpOnly: true,
                            secure: true
                        });
                        return res.status(401).json({
                            status: false,
                            message: 'Refresh token không hợp lệ!',
                            data: {}
                        });
                    }
                } catch (refreshTokenError) {
                    res.clearCookie('refresh_token', {
                        httpOnly: true,
                        secure: true
                    });
                    return res.status(401).json({
                        status: false,
                        message: 'Refresh token không hợp lệ!',
                        data: {}
                    });
                }
            } else {
                return res.status(401).json({
                    status: false,
                    message: 'Access token không hợp lệ!',
                    data: {}
                });
            }
        }
    }

    return res.status(401).json({
        status: false,
        message: 'Access token không tồn tại!',
        data: {}
    });
};

module.exports = deserializeUser;
