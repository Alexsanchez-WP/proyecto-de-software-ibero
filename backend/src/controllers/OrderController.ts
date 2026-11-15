import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { ApiResponseFactory } from '../utils/ApiResponseFactory';

export class OrderController {
  private orderService = new OrderService();

  createCheckoutSession = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const session = await this.orderService.createCheckoutSession(userId);
      res.json(ApiResponseFactory.success({ url: session.url }));
    } catch (error: any) {
      console.error('Checkout Error:', error);
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  finalizeOrder = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json(ApiResponseFactory.error('Session ID is required'));
      }
      const order = await this.orderService.finalizeOrder(sessionId);
      res.json(ApiResponseFactory.success(order));
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  getUserOrders = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const orders = await this.orderService.getUserOrders(userId);
      res.json(ApiResponseFactory.success(orders));
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  getAllOrders = async (req: Request, res: Response) => {
    try {
      const orders = await this.orderService.getAllOrders();
      res.json(ApiResponseFactory.success(orders));
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };
}
