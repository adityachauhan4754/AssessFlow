import express from 'express';
import { 
  createAssessment, 
  getAssessments, 
  getAssessmentById, 
  deleteAssessment, 
  getUserCategories,
  updateAssessment,
  getTakeAssessment,
  autoSaveAnswer,
  submitAssessment,
  getLaunchPadAssessments
} from '../controllers/assessmentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { assessmentSchema } from '../validators/assessmentValidator.js';

const router = express.Router();

router.get('/launch-pad', protect, getLaunchPadAssessments);
router.get('/categories', protect, getUserCategories);
router.route('/')
  .post(protect, validate(assessmentSchema), createAssessment)
  .get(protect, getAssessments);
router.route('/:id')
  .get(getAssessmentById) 
  .delete(protect, deleteAssessment)
  .put(protect, validate(assessmentSchema), updateAssessment);

router.get('/:id/take', protect, getTakeAssessment);
router.post('/:id/answers', protect, autoSaveAnswer);
router.post('/:id/submit', protect, submitAssessment);

export default router;
