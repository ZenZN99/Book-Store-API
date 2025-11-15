import type { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";
import User from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export async function isAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const secret = process.env.JWT_SECRET as string;

    if (!secret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jsonwebtoken.verify(token, secret) as { userId: string };

    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error from server" });
  }
}
