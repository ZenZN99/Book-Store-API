import express from 'express';
import * as cartController from '../controllers/cart.controller'
import { isAuthenticate } from '../middlewares/isAuthenticate';
const cartRouter = express.Router();

cartRouter.post('/:bookId', isAuthenticate, cartController.addToCart);
cartRouter.get('/', isAuthenticate,  cartController.getCartUser);
cartRouter.delete('/:bookId', isAuthenticate, cartController.deleteItemCart)
cartRouter.post('/quantity/:bookId', isAuthenticate,  cartController.updateQuantity);

export default cartRouter;