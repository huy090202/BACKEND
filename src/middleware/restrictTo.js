const restrictTo = (roles) => (req, res, next) => {
    const { role } = req.user;
    // console.log('role:', role);
    if (!roles.includes(role)) {
        return res.status(403).json({
            status: false,
            message: 'You are not allowed to perform this action',
            data: {}
        })
    }
    return next();
}

module.exports = restrictTo;