import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUser,
  verifyProducer,
  suspendUser,
  activateUser,
  createDeliveryPerson,
  getDeliveryPersons,
  getDashboardStats,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Validation pour création de livreur
const deliveryPersonValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom est requis'),
];

// Toutes les routes sont protégées et réservées aux admins
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Gestion utilisateurs
router.get('/', getUsers);
router.get('/delivery', getDeliveryPersons);
router.get('/:id', getUser);
router.put('/:id/verify', verifyProducer);
router.put('/:id/suspend', suspendUser);
router.put('/:id/activate', activateUser);

// Création livreur
router.post('/delivery', validate(deliveryPersonValidation), createDeliveryPerson);

export default router;
