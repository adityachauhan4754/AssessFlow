import express from 'express';
import { getSettings, updateSettings, archiveProject, deleteProject, getHistory } from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/current/settings')
  .get(protect, getSettings)
  .put(protect, updateSettings);

router.post('/current/archive', protect, archiveProject);
router.delete('/current', protect, deleteProject);

router.get('/current/history', protect, getHistory);

export default router;
