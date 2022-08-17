import express from "express";
import {
  createAccount,
  fundAccount,
  getUserAccounts,
  transfer,
  withdraw,
} from "../controllers/accountController.js";
import { authenticate } from "../controllers/authController.js";

const accountRouter = express();

accountRouter.route("/all/owner/:ownerId").get(getUserAccounts);

accountRouter.route("/creator/:creatorId").post(authenticate, createAccount);
accountRouter.route("/fund/owner/:ownerId").post(authenticate, fundAccount);

accountRouter.route("/withdraw/owner/:ownerId").post(authenticate, withdraw);

accountRouter.route("/transfer").post(transfer);

export default accountRouter;
