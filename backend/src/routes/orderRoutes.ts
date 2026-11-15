import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const orderController = new OrderController();

router.use(authenticateToken);

router.post('/checkout', orderController.createCheckoutSession);
router.post('/finalize', orderController.finalizeOrder);
router.get('/my-orders', orderController.getUserOrders);
router.get('/all', orderController.getAllOrders);

export default router;
