import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authenticateToken, authorizeAdmin } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();
const productController = new ProductController();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', authenticateToken, authorizeAdmin, upload.array('images', 5), productController.create);
router.put('/:id', authenticateToken, authorizeAdmin, upload.array('images', 5), productController.update);
router.delete('/:id', authenticateToken, authorizeAdmin, productController.delete);

export default router;
