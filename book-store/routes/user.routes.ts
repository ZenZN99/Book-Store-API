import express from "express";
import * as userController from "../controllers/user.controller";
import { isAuthenticate } from "../middlewares/isAuthenticate";
const userRouter = express.Router();

userRouter.post("/register", userController.register);

userRouter.post("/login", userController.login);

userRouter.get("/me", isAuthenticate, userController.me);

userRouter.put(
  "/profile",
  isAuthenticate,
  userController.upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  userController.profileUser
);
export default userRouter;
