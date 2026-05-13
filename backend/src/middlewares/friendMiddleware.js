import Conversation from '../models/Conversation.js';
import Friend from '../models/Friend.js';

// Hàm Canonical Ordering (Chuẩn hóa thứ tự dữ liệu để Tạo cặp có thứ tự cố định)
const pair = (a, b) => [a.toString(), b.toString()].sort();

export const checkFriendShip = async (req, res, next) => {
  try {
    const me = req.user._id.toString();
    const recipientId = req.body?.recipientId ?? null;

    if (!recipientId) {
      return res.status(400).json({ message: 'Need to provide receipientId' });
    }

    if (recipientId) {
      const [userA, userB] = pair(me, recipientId);
      const isFriend = await Friend.findOne({ userA, userB });

      if (!isFriend) {
        return res
          .status(400)
          .json({ message: 'Only friends can be send message' });
      }

      return next();
    }

    // To do: Group chat
  } catch (error) {
    console.error('Error when check friend ship', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
