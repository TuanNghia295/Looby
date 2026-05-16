import e from 'express';
import {
  sendDirectMessage,
  sendGroupMessage,
} from '../controllers/messageController.js';
import {
  checkFriendShip,
  checkGroupMembership,
} from '../middlewares/friendMiddleware.js';

const router = e.Router();

router.post('/direct', checkFriendShip, sendDirectMessage);
router.post('/group', checkGroupMembership, sendGroupMessage);

export default router;
