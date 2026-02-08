import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Validation pour l'inscription
const registerValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom est requis'),
];

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

// Validation pour le changement de mot de passe
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
];

// Routes publiques
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

// Routes protégées
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, validate(changePasswordValidation), changePassword);

export default router;
