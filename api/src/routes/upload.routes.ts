import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { createId } from '@paralleldrive/cuid2';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${createId()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Utilisez JPEG, PNG, WebP ou GIF.'));
    }
  },
});

router.post('/', authenticate, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Aucun fichier envoyé' });
  }

  const url = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    data: { url },
    message: 'Image uploadée avec succès',
  });
});

export default router;
