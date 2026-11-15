import { Cart, ICart } from '../models/Cart';
import mongoose from 'mongoose';

export class CartService {
  async getCart(userId: string): Promise<ICart | null> {
    return await Cart.findOne({ user: userId }).populate('items.product');
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<ICart> {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: new mongoose.Types.ObjectId(productId), quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: new mongoose.Types.ObjectId(productId), quantity });
      }
    }

    await cart.save();
    return cart;
  }

  async removeFromCart(userId: string, productId: string): Promise<ICart | null> {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    return cart;
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<ICart | null> {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.splice(itemIndex, 1);
      }
      await cart.save();
      return cart;
    }
    return null;
  }

  async clearCart(userId: string): Promise<void> {
    await Cart.findOneAndDelete({ user: userId });
  }
}
