/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")

app.use(express.json());

const cRoutes = require("./routes/companies")
app.use("/companies", cRoutes)

const iRoutes = require("./routes/invoices")
app.use("/invoices", iRoutes)

const inRoutes = require("./routes/industries")
app.use("/industries", inRoutes)


// 404 handler
app.use(function (req, res, next) {
  return next(new ExpressError("Not Found", 404));
});

// generic error handler
app.use(function (err, req, res, next) {
  // the default status is 500 Internal Server Error
  let status = err.status || 500;

  // set the status and alert the user
  return res.status(status).json({
    error: {
      message: err.message,
      status: status,
    },
  });
});


module.exports = app;
