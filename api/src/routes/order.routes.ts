import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  assignDelivery,
  getProducerOrders,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Validation pour création de commande
const createOrderValidation = [
  body('addressId').notEmpty().withMessage('L\'adresse de livraison est requise'),
];

// Validation pour changement de statut
const updateStatusValidation = [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED'])
    .withMessage('Statut invalide'),
];

// Toutes les routes sont protégées
router.use(authenticate);

// Routes client
router.post('/', authorize('CLIENT'), validate(createOrderValidation), createOrder);
router.get('/me', getMyOrders);

// Routes producteur (AVANT /:id)
router.get('/producer/orders', authorize('PRODUCER'), getProducerOrders);

// Routes admin
router.get('/', authorize('ADMIN'), getAllOrders);

router.get('/:id', getOrder);
router.put('/:id/status', authorize('CLIENT', 'PRODUCER', 'DELIVERY', 'ADMIN'), validate(updateStatusValidation), updateOrderStatus);
router.put('/:id/assign', authorize('ADMIN'), assignDelivery);

export default router;
