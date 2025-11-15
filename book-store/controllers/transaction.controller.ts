import type { Request, Response } from "express";
import Cart from "../models/Cart";
import User from "../models/User";
import Transaction from "../models/Transaction";

export async function transferBalance(req: Request, res: Response) {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "Cannot transfer to yourself" });
    }

    const senderCart = await Cart.findOne({ userId: senderId });
    if (!senderCart || senderCart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const totalAmount = senderCart.items.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "Users not found" });
    }

    if (sender.balance < totalAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    sender.balance -= totalAmount;
    await sender.save();

    receiver.balance += totalAmount;
    await receiver.save();

    const transaction = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount: totalAmount,
    });

    senderCart.items = [];
    await senderCart.save();

    return res.status(200).json({
      success: true,
      transaction,
      totalAmount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function rechargeBalance(req: Request, res: Response) {
  const userId = req.user._id;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.balance += +amount;
  await user.save();

  return res.status(200).json({ success: true, balance: user.balance });
}
