import express from 'express';
import { submitResponse, getResponses, getResponseById } from '../controllers/responseController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { responseSchema } from '../validators/responseValidator.js';

const router = express.Router();

router.post('/', protect, validate(responseSchema), submitResponse);
router.get('/', protect, getResponses);
router.get('/:id', protect, getResponseById);

export default router;
