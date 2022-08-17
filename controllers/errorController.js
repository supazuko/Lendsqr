import AppError from "../util/appError.js";

const sendErrorInDevelopment = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorInProduction = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  //internal errors
  console.log("err is ", err);
  return res.status(500).json({
    status: "error",
    message: `Looks like Something went wrong, Please try again`,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorInDevelopment(err, req, res);
  } else {
    sendErrorInProduction(err, req, res);
  }
};

export default globalErrorHandler;
