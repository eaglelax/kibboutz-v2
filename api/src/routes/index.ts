import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import addressRoutes from './address.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

export default router;
