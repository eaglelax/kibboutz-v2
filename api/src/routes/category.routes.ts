import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Validation pour création/modification de catégorie
const categoryValidation = [
  body('name').notEmpty().withMessage('Le nom est requis'),
];

// Routes publiques
router.get('/', getCategories);
router.get('/:id', getCategory);

// Routes admin
router.post('/', authenticate, authorize('ADMIN'), validate(categoryValidation), createCategory);
router.put('/:id', authenticate, authorize('ADMIN'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

export default router;
