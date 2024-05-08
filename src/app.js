require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

// init middlewares
// morgan: dev is a middleware that logs requests to the console
app.use(morgan("dev"));
// helmet is a middleware that sets various HTTP headers to secure the app
app.use(helmet());
// compression is a middleware that compresses response bodies for all requests that traverse through it
app.use(compression());
// express.json() is a middleware that parses incoming requests with JSON payloads
app.use(express.json());
// express.urlencoded() is a middleware that parses incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));
// init db
require("./dbs/init.mongodb");
// const { checkOverLoad } = require("./helpers/check.connect");
// checkOverLoad();
// init routes
app.use("/", require("./routes"));
// handling error
app.use((req, res, next) => {
    const error = new Error("Page Not Found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    const statusCode = error.status || 500;

    return res.status(statusCode).json({
        status: "error",
        code: statusCode,
        stack: error.stack,
        message: error.message || "Internal Server Error",
    })
})
module.exports = app;
