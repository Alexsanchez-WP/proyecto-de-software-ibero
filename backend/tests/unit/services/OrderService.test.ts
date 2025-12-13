import { OrderService } from '../../../src/services/OrderService';
import { Cart } from '../../../src/models/Cart';
import { Order } from '../../../src/models/Order';
import { Payment } from 'mercadopago';
import QRCode from 'qrcode';


jest.mock('../../../src/models/Cart');
jest.mock('../../../src/models/Order');
jest.mock('qrcode');


jest.mock('mercadopago', () => {
  return {
    MercadoPagoConfig: jest.fn(),
    Preference: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({ init_point: 'http://mock-url.com' })
    })),
    Payment: jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({
        status: 'approved',
        metadata: { user_id: 'user123' }
      })
    }))
  };
});

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a preference and return the init_point url', async () => {
      const mockCart = {
        user: 'user123',
        items: [
          {
            product: { _id: 'prod1', name: 'Test Product', price: 1000, images: [] },
            quantity: 2
          }
        ]
      };

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCart)
      });

      const result = await orderService.createCheckoutSession('user123');

      expect(result).toHaveProperty('url', 'http://mock-url.com');
      expect(Cart.findOne).toHaveBeenCalledWith({ user: 'user123' });
    });

    it('should throw error if cart is empty', async () => {
      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await expect(orderService.createCheckoutSession('user123'))
        .rejects.toThrow('Cart is empty');
    });
  });

  describe('finalizeOrder', () => {
    it('should create order and clear cart if payment is approved', async () => {
      const mockCart = {
        user: 'user123',
        items: [
          {
            product: { _id: 'prod1', name: 'Test Product', price: 1000 },
            quantity: 2
          }
        ]
      };

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCart)
      });
      (Order.findOne as jest.Mock).mockResolvedValue(null);
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,fakeqr');
      
      const mockSave = jest.fn().mockResolvedValue({});
      (Order as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave
      }));

      const result = await orderService.finalizeOrder('payment123');

      expect(Order).toHaveBeenCalledWith(expect.objectContaining({
        user: 'user123',
        totalAmount: 2000,
        status: 'paid',
        paymentId: 'payment123',
        qrCodeData: 'data:image/png;base64,fakeqr'
      }));
      expect(mockSave).toHaveBeenCalled();
      expect(Cart.findOneAndDelete).toHaveBeenCalledWith({ user: 'user123' });
    });

    it('should return existing order if already processed', async () => {
      const mockOrder = { _id: 'order123', paymentId: 'payment123' };
      (Order.findOne as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.finalizeOrder('payment123');

      expect(result).toEqual(mockOrder);
      expect(Cart.findOneAndDelete).not.toHaveBeenCalled();
    });

    it('should throw error if payment not approved', async () => {
      // Override mock for this test
      const mockPaymentGet = jest.fn().mockResolvedValue({
        status: 'pending',
        metadata: { user_id: 'user123' }
      });
      (Payment as unknown as jest.Mock).mockImplementation(() => ({
        get: mockPaymentGet
      }));

      await expect(orderService.finalizeOrder('payment123'))
        .rejects.toThrow('Payment not approved');
    });
  });

  describe('getUserOrders', () => {
    it('should return orders for user', async () => {
      const mockOrders = [{ _id: 'order1' }, { _id: 'order2' }];
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOrders)
      });

      const result = await orderService.getUserOrders('user123');

      expect(result).toEqual(mockOrders);
      expect(Order.find).toHaveBeenCalledWith({ user: 'user123' });
    });
  });
});
