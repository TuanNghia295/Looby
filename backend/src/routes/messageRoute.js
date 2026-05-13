import e from 'express';
import {
  createGroup,
  sendDirectMessage,
  sendGroupMessage,
} from '../controllers/messageController.js';

const router = e.Router();

router.post('/direct', sendDirectMessage);
router.post('/group', sendGroupMessage);
router.post('/group/create', createGroup);

export default router;
