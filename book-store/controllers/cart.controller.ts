import type { Request, Response } from "express";
import Cart from "../models/Cart";
import type { CartItems } from "../models/Cart";
import Book from "../models/Book";
import mongoose from "mongoose";

export async function addToCart(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    if (!bookId) return res.status(400).json({ error: "Book ID is required" });
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ error: "Book not found" });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      const newItem: CartItems = {
        bookId: book._id,
        quantity: 1,
        totalPrice: book.price,
      };

      cart = new Cart({
        userId: new mongoose.Types.ObjectId(userId),
        items: [newItem],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.bookId.toString() === bookId
      );

      if (itemIndex > -1 && cart.items[itemIndex]) {
        cart.items[itemIndex].quantity += 1;
        cart.items[itemIndex].totalPrice =
          cart.items[itemIndex].quantity * book.price;
      } else {
        const newItem: CartItems = {
          bookId: book._id,
          quantity: 1,
          totalPrice: book.price,
        };
        cart.items.push(newItem);
      }
    }

    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getCartUser(req: Request, res: Response) {
  try {
    const userId = req.user._id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const cart = await Cart.findOne({ userId }).populate(
      "items.bookId",
      "title price image"
    );

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function deleteItemCart(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!bookId) return res.status(400).json({ error: "Book ID is required" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter((item) => item.bookId.toString() !== bookId);

    await cart.save();

    return res.status(200).json({ success: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateQuantity(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!bookId) return res.status(400).json({ error: "Book ID is required" });
    if (quantity < 1)
      return res.status(400).json({ error: "Quantity must be at least 1" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.bookId.toString() === bookId
    );
    if (itemIndex === -1)
      return res.status(404).json({ error: "Book not in cart" });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ error: "Book not found" });

    if (cart.items[itemIndex]) {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].totalPrice = quantity * book.price;
    }

    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
