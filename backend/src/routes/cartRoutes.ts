import { Router } from 'express';
import { CartController } from '../controllers/CartController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const cartController = new CartController();

router.use(authenticateToken);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:productId', cartController.updateItemQuantity);
router.delete('/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
