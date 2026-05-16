import Conversation from '../models/Conversation.js';
import Friend from '../models/Friend.js';

// Hàm Canonical Ordering (Chuẩn hóa thứ tự dữ liệu để Tạo cặp có thứ tự cố định)
const pair = (a, b) => [a.toString(), b.toString()].sort();

export const checkFriendShip = async (req, res, next) => {
  try {
    const me = req.user._id.toString();
    const recipientId = req.body?.recipientId ?? null;
    const participantIds = req.body?.participantIds ?? [];

    if (!recipientId && participantIds.length === 0) {
      return res
        .status(400)
        .json({ message: 'Need to provide receipientId or participantIds' });
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
    const friendChecks = participantIds.map(async id => {
      const [userA, userB] = pair(me, id);
      const friend = await Friend.findOne({
        userA,
        userB,
      });

      return friend ? null : id;
    });

    const result = await Promise.all(friendChecks);
    const notFriends = result.filter(Boolean); // Lọc ra các giá trị bằng True

    if (notFriends.length > 0) {
      return res.status(403).json({
        message: 'Only friends can be added to conversation',
        notFriends,
      });
    }

    next();
  } catch (error) {
    console.error('Error when check friend ship', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isMember = conversation.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not in this group' });
    }

    req.conversation = conversation;

    next();
  } catch (error) {
    console.error('Error check group membership', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
