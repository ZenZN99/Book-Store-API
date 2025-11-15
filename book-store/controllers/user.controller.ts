import type { Request, Response } from "express";
import validator from "validator";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token";
import multer from "multer";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export async function register(req: Request, res: Response) {
  try {
    const { fullname, email, password, confirmPassword } = req.body;

    if (!fullname || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(401).json({ error: "Invalid email address" });
    }

    if (password.length < 8) {
      return res
        .status(401)
        .json({ error: "Password must be at least 8 characters long" });
    }

    if (password !== confirmPassword) {
      return res
        .status(401)
        .json({ error: "Password and confirmation do not match" });
    }

    const existsUser = await User.findOne({ email });

    if (existsUser) {
      return res.status(401).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 13);

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id.toString());

    return res.status(201).json({
      success: "An account has been created successfully",
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        avatar: newUser.avatar,
        cover: newUser.cover,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating an account" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email Invalid" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Password Invalid" });
    }
    const token = generateToken(user._id.toString());
    return res.status(200).json({
      success: "You have logged in successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        cover: user.cover,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "A login error occurred" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      balance: user.balance,
      avatar: user.avatar,
      cover: user.cover,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data" });
  }
}

export async function profileUser(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const files = req.files as {
      avatar?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    };

    const avatarFile = files?.avatar?.[0];
    const coverFile = files?.cover?.[0];

    const updatedData: any = {};

    const extractPublicId = (url: string) => {
      const parts = url.split("/");
      const file = parts.pop()!;
      return file.split(".")[0];
    };

    const uploadToCloudinary = (file: Express.Multer.File, folder: string) => {
      return new Promise<any>((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    if (avatarFile) {
      if (user.avatar && user.avatar.includes("res.cloudinary.com")) {
        const oldId = extractPublicId(user.avatar);
        await cloudinary.v2.uploader.destroy(`users/avatars/${oldId}`);
      }

      const avatarUpload = await uploadToCloudinary(
        avatarFile,
        "users/avatars"
      );

      updatedData.avatar = avatarUpload.secure_url;
    }

    if (coverFile) {
      if (user.cover && user.cover.includes("res.cloudinary.com")) {
        const oldId = extractPublicId(user.cover);
        await cloudinary.v2.uploader.destroy(`users/covers/${oldId}`);
      }

      const coverUpload = await uploadToCloudinary(coverFile, "users/covers");

      updatedData.cover = coverUpload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, {
      new: true,
    });

    return res.status(200).json({
      success: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while updating the profile.",
    });
  }
}
