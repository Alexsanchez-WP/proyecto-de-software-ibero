import { Request, Response } from 'express';
import { CartService } from '../services/CartService';
import { ApiResponseFactory } from '../utils/ApiResponseFactory';

export class CartController {
  private cartService = new CartService();

  getCart = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const cart = await this.cartService.getCart(userId);
      res.json(ApiResponseFactory.success(cart));
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  addToCart = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { productId, quantity } = req.body;
      const item = await this.cartService.addToCart(userId, productId, quantity);
      res.status(201).json(ApiResponseFactory.success(item, 'Item added to cart'));
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  removeFromCart = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const productId = req.params.productId;
      const success = await this.cartService.removeFromCart(userId, productId);
      if (success) {
        res.json(ApiResponseFactory.success(null, 'Item removed from cart'));
      } else {
        res.status(404).json(ApiResponseFactory.error('Item not found in cart'));
      }
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  updateItemQuantity = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const productId = req.params.productId;
      const { quantity } = req.body;
      
      const cart = await this.cartService.updateItemQuantity(userId, productId, quantity);
      if (cart) {
        res.json(ApiResponseFactory.success(cart, 'Cart updated'));
      } else {
        res.status(404).json(ApiResponseFactory.error('Item not found in cart'));
      }
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  clearCart = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      await this.cartService.clearCart(userId);
      res.json(ApiResponseFactory.success(null, 'Cart cleared'));
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };
}
