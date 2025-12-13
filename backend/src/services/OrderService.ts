import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import QRCode from 'qrcode';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export class OrderService {
  async createCheckoutSession(userId: string) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const validItems = cart.items.filter((item: any) => item.product);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    const items = validItems.map((item: any) => ({
      id: item.product._id.toString(),
      title: item.product.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.product.price),
      currency_id: 'COP',
      picture_url: item.product.images && item.product.images.length > 0 
        ? (item.product.images[0].startsWith('http') ? item.product.images[0] : `${backendUrl}${item.product.images[0]}`)
        : undefined,
    }));

    const preference = new Preference(client);
    const body = {
      items: items,
      back_urls: {
        success: `${frontendUrl}/success`,
        failure: `${frontendUrl}/carrito`,
        pending: `${frontendUrl}/carrito`
      },
      auto_return: 'approved',
      metadata: {
        user_id: userId.toString()
      }
    };

    console.log('Creating Preference with body:', JSON.stringify(body, null, 2));

    const result = await preference.create({ body });

    return { url: result.init_point };
  }

  async finalizeOrder(paymentId: string) {
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status !== 'approved') {
      throw new Error('Payment not approved');
    }

    const userId = paymentData.metadata.user_id;
    if (!userId) throw new Error('User ID not found in payment metadata');

    const existingOrder = await Order.findOne({ paymentId: paymentId });
    if (existingOrder) return existingOrder;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) throw new Error('Cart not found or already processed');

    const validItems = cart.items.filter((item: any) => item.product);

    const orderItems = validItems.map((item: any) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();

    const qrData = JSON.stringify({
      orderId: paymentId,
      pickupCode: pickupCode,
      user: userId
    });

    const qrCodeImage = await QRCode.toDataURL(qrData);

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      status: 'paid',
      paymentId: paymentId,
      pickupCode,
      qrCodeData: qrCodeImage
    });

    await order.save();

    await Cart.findOneAndDelete({ user: userId });

    return order;
  }

  async getUserOrders(userId: string) {
    // Ensure userId is treated as an ObjectId for the query
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Order.find({ user: userObjectId }).sort({ created_at: -1 });
  }

  async getAllOrders() {
    return await Order.find().populate('user', 'username email').sort({ created_at: -1 });
  }
}
