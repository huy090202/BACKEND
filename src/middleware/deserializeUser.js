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
                    message: 'User not found!',
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
                        message: 'Refresh token not provided!',
                        data: {}
                    });
                }

                try {
                    // Verify refresh token
                    const verificationResult = await verifyToken(refreshToken);

                    if (verificationResult.status === 'OK') {
                        // Sent new access token to client
                        return res.json({
                            status: true,
                            message: 'Access token has expired, but refresh token is valid!',
                            data: {
                                accessToken: verificationResult.access_token
                            }
                        });
                    } else {
                        // Delete refresh token if it's invalid
                        res.clearCookie('refresh_token', {
                            httpOnly: true,
                            secure: true
                        });
                        return res.status(401).json({
                            status: false,
                            message: 'Invalid refresh token!',
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
                        message: 'Invalid refresh token!',
                        data: {}
                    });
                }
            } else {
                return res.status(401).json({
                    status: false,
                    message: 'Invalid access token!',
                    data: {}
                });
            }
        }
    }

    return res.status(401).json({
        status: false,
        message: 'Authorization denied!',
        data: {}
    });
};

module.exports = deserializeUser;
