import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  addProductImage,
  deleteProductImage,
} from '../controllers/product.controller';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Validation pour création de produit
const productValidation = [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('description').notEmpty().withMessage('La description est requise'),
  body('price').isInt({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('unit').isIn(['KG', 'GRAM', 'UNIT', 'LITER', 'TAS', 'BUNCH']).withMessage('Unité invalide'),
  body('categoryId').notEmpty().withMessage('La catégorie est requise'),
  body('stock').isFloat({ min: 0 }).withMessage('Le stock doit être un nombre positif'),
];

// Routes publiques
router.get('/', optionalAuth, getProducts);

// Routes producteur (AVANT /:id pour éviter que /producer/me soit capturé par /:id)
router.get('/producer/me', authenticate, authorize('PRODUCER'), getMyProducts);

router.get('/:id', optionalAuth, getProduct);
router.post('/', authenticate, authorize('PRODUCER'), validate(productValidation), createProduct);
router.put('/:id', authenticate, authorize('PRODUCER', 'ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('PRODUCER', 'ADMIN'), deleteProduct);

// Routes images
router.post('/:id/images', authenticate, authorize('PRODUCER', 'ADMIN'), addProductImage);
router.delete('/:id/images/:imageId', authenticate, authorize('PRODUCER', 'ADMIN'), deleteProductImage);

export default router;
