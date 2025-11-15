import express from "express";
import * as bookController from "../controllers/book.controller";
import { isAuthenticate } from "../middlewares/isAuthenticate";

const bookRouter = express.Router();

bookRouter.get("/", bookController.getAllBooks);

bookRouter.get("/user/books", isAuthenticate, bookController.getBookUser);
bookRouter.post(
  "/",
  isAuthenticate,
  bookController.upload.single("image"),
  bookController.createBook
);
bookRouter.post("/like/:id", isAuthenticate, bookController.likeBook);

bookRouter.get("/:id", bookController.getbookById);
bookRouter.put("/:id", isAuthenticate, bookController.updateBook);
bookRouter.delete("/:id", isAuthenticate, bookController.deleteBook);

export default bookRouter;
