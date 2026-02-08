import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Validation pour création/modification d'adresse
const addressValidation = [
  body('label').notEmpty().withMessage('Le libellé est requis'),
  body('fullAddress').notEmpty().withMessage('L\'adresse complète est requise'),
  body('city').notEmpty().withMessage('La ville est requise'),
];

// Toutes les routes sont protégées
router.use(authenticate);

router.get('/', getAddresses);
router.get('/:id', getAddress);
router.post('/', validate(addressValidation), createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/default', setDefaultAddress);

export default router;
