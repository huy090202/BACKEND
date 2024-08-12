const userRouter = require("./user.router");

const routes = (app) => {
    app.use("api/v1/user", userRouter)
};

module.exports = routes;