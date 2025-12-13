import { CartService } from '../../../src/services/CartService';
import { Cart } from '../../../src/models/Cart';
import mongoose from 'mongoose';

jest.mock('../../../src/models/Cart');

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    cartService = new CartService();
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return cart for user', async () => {
      const mockCart = { user: 'user1', items: [] };
      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCart)
      });

      const result = await cartService.getCart('user1');
      expect(result).toEqual(mockCart);
    });
  });

  describe('addToCart', () => {
    it('should create new cart if not exists', async () => {
      (Cart.findOne as jest.Mock).mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue({});
      (Cart as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
        items: []
      }));

      await cartService.addToCart('user1', '507f1f77bcf86cd799439011', 1);

      expect(Cart).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });

    it('should add item to existing cart', async () => {
      const mockCart = {
        user: 'user1',
        items: [],
        save: jest.fn().mockResolvedValue({})
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartService.addToCart('user1', '507f1f77bcf86cd799439011', 1);

      expect(mockCart.items).toHaveLength(1);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should update quantity if item exists', async () => {
      const productId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const mockCart = {
        user: 'user1',
        items: [{ product: productId, quantity: 1 }],
        save: jest.fn().mockResolvedValue({})
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartService.addToCart('user1', '507f1f77bcf86cd799439011', 2);

      expect(mockCart.items[0].quantity).toBe(3);
      expect(mockCart.save).toHaveBeenCalled();
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const productId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const mockCart = {
        user: 'user1',
        items: [{ product: productId, quantity: 1 }],
        save: jest.fn().mockResolvedValue({})
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartService.removeFromCart('user1', '507f1f77bcf86cd799439011');

      expect(mockCart.items).toHaveLength(0);
      expect(mockCart.save).toHaveBeenCalled();
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      const productId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const mockCart = {
        user: 'user1',
        items: [{ product: productId, quantity: 1 }],
        save: jest.fn().mockResolvedValue({})
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartService.updateItemQuantity('user1', '507f1f77bcf86cd799439011', 5);

      expect(mockCart.items[0].quantity).toBe(5);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should remove item if quantity is 0', async () => {
      const productId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const mockCart = {
        user: 'user1',
        items: [{ product: productId, quantity: 1 }],
        save: jest.fn().mockResolvedValue({})
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartService.updateItemQuantity('user1', '507f1f77bcf86cd799439011', 0);

      expect(mockCart.items).toHaveLength(0);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should return null if item not found in cart', async () => {
      const productId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      const mockCart = {
        user: 'user1',
        items: [{ product: productId, quantity: 1 }],
        save: jest.fn().mockResolvedValue({})
      };
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.updateItemQuantity('user1', 'other_product_id', 5);

      expect(result).toBeNull();
    });
  });

  describe('clearCart', () => {
    it('should delete cart', async () => {
      (Cart.findOneAndDelete as jest.Mock).mockResolvedValue({});

      await cartService.clearCart('user1');

      expect(Cart.findOneAndDelete).toHaveBeenCalledWith({ user: 'user1' });
    });
  });
});
