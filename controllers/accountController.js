import catchAsync from "../util/catchAsync.js";
import { v4 as uuidv4 } from "uuid";
import applicationKnex from "../index.js";
import { request } from "express";
import AppError from "../util/AppError.js";

export const createAccount = catchAsync(async (req, res, next) => {
  const creatorId = req.params.creatorId;

  const userArray = await applicationKnex("users")
    .where({ id: creatorId })
    .select("id", "firstName", "lastName", "password", "email");
  const user = userArray[0];
  if (!user) {
    return next(new AppError("No user found with that id", 401));
  }

  const id = uuidv4();
  const accountNumber = uuidv4();
  await applicationKnex("account").insert({
    id,
    accountNumber,
    balance: 0.0,
    ownerId: user.id,
  });

  const savedAccount = await applicationKnex("account")
    .where({ accountNumber })
    .select("id", "accountNumber", "balance", "ownerId");
  return res.status(201).json({
    success: true,
    message: `Account created for user ${user.email}`,
    account: savedAccount[0],
  });
});

export const fundAccount = catchAsync(async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const { accountNumber, amount } = req.body;
  const userArray = await applicationKnex("users")
    .where({ id: ownerId })
    .select("id", "firstName", "lastName", "password", "email");
  const user = userArray[0];
  if (!user) {
    return next(new AppError("No user found with that id", 401));
  }

  const accountArray = await applicationKnex("account")
    .where({
      accountNumber: accountNumber,
      ownerId: ownerId,
    })
    .select("id", "accountNumber", "balance", "ownerId");
  const account = accountArray[0];
  if (!account) {
    return next(
      new AppError(
        `No account with number  ${accountNumber} found belognging to user  with id ${ownerId}`,
        401
      )
    );
  }
  const updatedBalance = account.balance + amount;
  await applicationKnex("account").update({ balance: updatedBalance }).where({
    accountNumber: accountNumber,
    ownerId: ownerId,
  });
  return res.status(200).json({
    success: true,
  });
});

export const getUserAccounts = catchAsync(async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const accounts = await applicationKnex("account")
    .where({
      ownerId,
    })
    .select("*");
  return res.status(200).json({
    success: true,
    accounts,
  });
});

export const withdraw = catchAsync(async (req, res, next) => {
  const ownerId = req.params.ownerId;
  const { accountNumber, amount } = req.body;
  const userArray = await applicationKnex("users")
    .where({ id: ownerId })
    .select("id", "firstName", "lastName", "password", "email");
  const user = userArray[0];
  if (!user) {
    return next(new AppError("No user found with that id", 401));
  }

  const accountArray = await applicationKnex("account")
    .where({
      accountNumber: accountNumber,
      ownerId: ownerId,
    })
    .select("id", "accountNumber", "balance", "ownerId");
  const account = accountArray[0];
  if (!account) {
    return next(
      new AppError(
        `No account with number  ${accountNumber} found belognging to user  with id ${ownerId}`,
        401
      )
    );
  }
  const updatedBalance = account.balance - amount;

  if (updatedBalance < 0) {
    return next(new AppError("Insufficient funds to withdraw", 400));
  }
  await applicationKnex("account").update({ balance: updatedBalance }).where({
    accountNumber: accountNumber,
    ownerId: ownerId,
  });
  return res.status(200).json({
    success: true,
  });
});

export const transfer = catchAsync(async (req, res, next) => {
  const {
    senderId,
    senderAccountNumber,
    recipientId,
    recipientAccountNumber,
    amount,
  } = req.body;
  const senderAccountResult = await applicationKnex("account")
    .where({
      accountNumber: senderAccountNumber,
      ownerId: senderId,
    })
    .select("*");
  const senderAccount = senderAccountResult[0];
  if (!senderAccount) {
    return next(
      new AppError(
        `No account with number ${senderAccountNumber} found belognging to user  with id ${senderId}`,
        401
      )
    );
  }

  const recipientAccountResult = await applicationKnex("account").where({
    accountNumber: recipientAccountNumber,
    ownerId: recipientId,
  });

  const recipientAccount = recipientAccountResult[0];
  if (!recipientAccount) {
    return next(
      new AppError(
        `No account with number ${recipientAccountNumber} found belognging to user  with id ${recipientId}`,
        401
      )
    );
  }
  recipientAccount.balance = recipientAccount.balance + amount;
  if (senderAccount.balance < amount) {
    return next(new AppError("Insufficient funds to transfer", 400));
  }
  senderAccount.balance = senderAccount.balance - amount;

  await applicationKnex("account")
    .insert([recipientAccount, senderAccount])
    .onConflict(["id", "accountNumber", "ownerId"])
    .merge();

  res.status(200).json({
    success: true,
  });
});
