import e from 'express';
import { checkFriendShip } from '../middlewares/friendMiddleware.js';
import {
  createConservation,
  getConversations,
  getMessages,
} from '../controllers/conversationController.js';

const router = e.Router();

router.post('/', checkFriendShip, createConservation);
router.get('/', getConversations);
router.get('/:conversationId/messages', getMessages);

export default router;
