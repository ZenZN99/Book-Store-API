import mongoose from "mongoose";

interface IBook {
  title: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  userId: mongoose.Schema.Types.ObjectId;
  likes: number;
  likedBy: mongoose.Schema.Types.ObjectId[];
}

const bookSchema = new mongoose.Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 1,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);
export default Book;
