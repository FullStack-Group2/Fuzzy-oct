import { Router } from 'express';
import { getAllProducts, getProductById } from '../controllers/ProductController';

const router = Router();

// GET /api/products - list products with optional filters
router.get('/', getAllProducts);

// GET /api/products/:productId - product details
router.get('/:productId', getProductById);

export default router;
