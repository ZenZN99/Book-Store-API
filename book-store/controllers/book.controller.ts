import type { Request, Response } from "express";
import Book from "../models/Book";
import multer from "multer";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export async function getAllBooks(req: Request, res: Response) {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    if (!books || books.length === 0) {
      return res.status(404).json({ error: "There are no books yet" });
    }

    return res.status(200).json(books);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving books" });
  }
}

export async function getbookById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(401).json({ error: "book ID is required" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: "book not found!" });
    }
    return res.status(200).json(book);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "An error occurred while retrieving a book using the ID",
    });
  }
}

export async function createBook(req: Request, res: Response) {
  try {
    const { title, description, price, stock, category } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: "All required fields" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber)) {
      return res.status(401).json({ error: "price and stock is type number" });
    }

    if (priceNumber < 1 || stockNumber < 1) {
      return res.status(401).json({ error: "It cannot be a negative number" });
    }

    const uploadToCloudinary = (): Promise<{
      secure_url: string;
      public_id: string;
    }> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "books", use_filename: true, unique_filename: false },
          (error, result) => {
            if (error) return reject(error);
            if (!result)
              return reject(new Error("No result returned from Cloudinary"));
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );
        streamifier.createReadStream(req.file!.buffer).pipe(stream);
        console.log(req.file);
      });
    };

    const userId = req.user._id;

    const result = await uploadToCloudinary();

    const newBook = await Book.create({
      title,
      description,
      image: result.secure_url,
      price,
      stock,
      category,
      userId,
      likes: 0,
      likedBy: [],
    });

    return res.status(201).json(newBook);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while uploading a book" });
  }
}

export async function updateBook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(401).json({ error: "book ID is required" });
    }
    const user = req.user.id;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, description, price, stock, category } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: "All required fields" });
    }

    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber)) {
      return res.status(401).json({ error: "price and stock is type number" });
    }

    if (priceNumber < 1 || stockNumber < 1) {
      return res.status(401).json({ error: "It cannot be a negative number" });
    }
    const book = await Book.findOneAndUpdate(
      { _id: id, userId: user },
      { title, description, price, stock, category }
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found!" });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while editing a book" });
  }
}

export async function deleteBook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(401).json({ error: "book ID is required" });
    }
    const user = req.user.id;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const book = await Book.findOneAndDelete({ _id: id, userId: user });

    if (!book) {
      return res.status(404).json({ error: "Book not found!" });
    }

    return res.status(200).json({ success: "Book has been deleted" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error ocurred while deleting a book" });
  }
}

export async function getBookUser(req: Request, res: Response) {
  try {
    const user = req.user._id;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const books = await Book.find({ userId: user }).sort({ createdAt: -1 });
    if (!books || books.length === 0) {
      return res.status(404).json({ error: "There are no books yet." });
    }

    return res.status(200).json(books);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching user books" });
  }
}

export async function likeBook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(401).json({ error: "book ID is required" });
    }
    const user = req.user.id;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found!" });
    }

    const hasLiked = book.likedBy.some(
      (likedId) => likedId.toString() === user.toString()
    );

    if (hasLiked) {
      book.likes = Math.max(0, book.likes - 1);
      book.likedBy = book.likedBy.filter(
        (likedId) => likedId.toString() !== user.toString()
      );
    } else {
      book.likes += 1;
      book.likedBy.push(user);
    }

    await book.save();

    return res.status(200).json({
      success: hasLiked ? "Like removed" : "The picture was liked",
      likes: book.likes,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while liking the book" });
  }
}
