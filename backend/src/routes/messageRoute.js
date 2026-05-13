import e from 'express';
import {
  createGroup,
  sendDirectMessage,
  sendGroupMessage,
} from '../controllers/messageController.js';
import { checkFriendShip } from '../middlewares/friendMiddleware.js';

const router = e.Router();

router.post('/direct', checkFriendShip, sendDirectMessage);
router.post('/group', sendGroupMessage);
router.post('/group/create', createGroup);

export default router;
