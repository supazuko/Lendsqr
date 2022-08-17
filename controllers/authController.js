import applicationKnex from "../index.js";
import { v4 as uuidv4 } from "uuid";
import catchAsync from "../util/catchAsync.js";
import AppError from "../util/AppError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import isEmail from "validator/lib/isemail.js";
import { promisify } from "util";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const register = catchAsync(async (req, res, next) => {
  const { email, firstName, lastName, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return next(new AppError("Required field missing", 400));
  }

  if (!isEmail(email)) {
    return next(new AppError("Invalid email provided", 400));
  }
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8  characters", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const id = uuidv4();
  await applicationKnex("users").insert({
    id,
    email,
    firstName,
    lastName,
    password: hashedPassword,
  });

  const userArray = await applicationKnex("users")
    .where({ email: email })
    .select("id", "firstName", "lastName", "email");

  const user = userArray[0];
  const userId = user.id;
  const token = signToken(userId);
  return res.status(201).json({
    success: true,
    message: "User registred successfully",
    user,
    token,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const userArray = await applicationKnex("users")
    .where({ email: email })
    .select("id", "firstName", "lastName", "password", "email");

  const user = userArray[0];

  if (!user) {
    return next(new AppError("No user found with that email", 401));
  }
  const verified = await bcrypt.compare(password, user.password);
  if (!verified) {
    return next(new AppError("Incorrect password given", 401));
  }
  const token = signToken(user.id);
  user.password = undefined;
  return res.status(200).json({
    success: true,
    token,
    user,
  });
});

export const authenticate = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in, please log in to gain access", 401)
    );
  }
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  const embeddedId = decodedToken.id;
  const userArray = await applicationKnex("users")
    .where({ id: embeddedId })
    .select("id", "firstName", "lastName", "password", "email");
  const currentUser = userArray[0];
  if (!currentUser) {
    return next(new AppError("User on this token no longer exists", 401));
  }
  req.user = currentUser;
  next();
});
