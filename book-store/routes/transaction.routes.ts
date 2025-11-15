import express from "express";
import { isAuthenticate } from "../middlewares/isAuthenticate";
import { rechargeBalance, transferBalance } from "../controllers/transaction.controller";

const transactionRouter = express.Router();

transactionRouter.post("/transfer", isAuthenticate, transferBalance);
transactionRouter.post("/balance", isAuthenticate, rechargeBalance)
export default transactionRouter;
