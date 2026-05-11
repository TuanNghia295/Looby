import e from 'express';
import {
  acceptFriendRequest,
  sendFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getFriendRequest,
} from '../controllers/friendController.js';

const router = e.Router();

router.post('/requests', sendFriendRequest);
router.post('/requests/:requestId/accept', acceptFriendRequest);
router.post('/request/:requestId/decline', declineFriendRequest);

router.get('/', getAllFriends);
router.get('/request', getFriendRequest);

export default router;
