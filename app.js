import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRouter from "./routers/authRouter.js";
import accountRouter from "./routers/accountRouter.js";
import AppError from "./util/appError.js";
import globalErrorHandler from "./controllers/errorController.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ limit: "10kb", extended: false }));

app.use("/ping", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "pong",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/account", accountRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
