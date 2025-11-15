import mongoose from "mongoose";

interface IUser {
  fullname: string;
  email: string;
  password: string;
  avatar: string;
  cover: string;
  balance: number;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dgagbheuj/image/upload/v1763194734/avatar-default-image_yc4xy4.jpg",
    },
    cover: {
      type: String,
      default:
        "https://res.cloudinary.com/dgagbheuj/image/upload/v1763194811/cover-default-image_uunwq6.jpg",
    },
    balance: {
      type: Number,
      default: 2300,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
