import mongoose, {Types} from "mongoose";

 export interface CartItems {
  bookId: Types.ObjectId;
  quantity: number;
  totalPrice: number;
}

interface ICart {
  userId: mongoose.Schema.Types.ObjectId;
  items: CartItems[];
}

const cartSchema = new mongoose.Schema<ICart>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  items: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
      },
      quantity: {
        type: Number,
        default: 1,
      },
      totalPrice:{
        type: Number,
        default: 0,
      }
    },
  ],
},{timestamps: true});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
