import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';
import userRouter from './routes/user.routes';
import bookRouter from './routes/book.routes';
import cartRouter from './routes/cart.routes';
import transactionRouter from './routes/transaction.routes';
import cors from 'cors';
import path from 'path';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
connectDB();
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/' , (req , res) => {
    res.send("Hello via bun!");
});

app.use('/api/auth', userRouter);
app.use('/api/book', bookRouter);
app.use('/api/cart', cartRouter);
app.use('/apit/ransaction', transactionRouter);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(port , () => {
    console.log(`Server is running on port ${port}`); 
});