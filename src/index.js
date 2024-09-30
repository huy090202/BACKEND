const express = require('express');
const { json, urlencoded } = require('body-parser');
const cookieParser = require('cookie-parser');
const { config } = require('dotenv');
const routes = require('./routers');
const connecttion = require('./configs/database');

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Setup cors
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", process.env.URL_REACT);
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS,PATCH"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

app.use(json({ limit: "50mb" }));
app.use(urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Setup routes
routes(app);

// Connect to database and start server
connecttion();

app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
});