import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Validation pour ajout au panier
const addToCartValidation = [
  body('productId').notEmpty().withMessage('L\'ID du produit est requis'),
  body('quantity').isFloat({ min: 0.1 }).withMessage('La quantité doit être positive'),
];

// Validation pour mise à jour quantité
const updateCartValidation = [
  body('quantity').isFloat({ min: 0.1 }).withMessage('La quantité doit être positive'),
];

// Toutes les routes sont protégées
router.use(authenticate);

router.get('/', getCart);
router.post('/', validate(addToCartValidation), addToCart);
router.put('/:itemId', validate(updateCartValidation), updateCartItem);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

export default router;
