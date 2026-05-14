import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Friend from '../models/Friend.js';
import Message from '../models/Message.js';

export const createConservation = async (req, res) => {
  try {
    const { type, groupName, participantIds } = req.body;
    const creatorId = req.user._id;

    if (!['direct', 'group'].includes(type)) {
      return res.status(400).json({ message: 'Conversation type invalid' });
    }

    if (!Array.isArray(participantIds)) {
      return res.status(400).json({ message: 'participantIds must be array' });
    }

    const uniqueParticipantsIds = [
      ...new Set(
        participantIds.filter(id => id.toString() !== creatorId.toString())
      ),
    ];

    if (uniqueParticipantsIds.length === 0) {
      return res
        .status(400)
        .json({ message: 'Please add at least one participant' });
    }

    const invalidIds = uniqueParticipantsIds.filter(
      id => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: 'Some participant ids are invalid',
        invalidIds,
      });
    }

    const friendPairs = uniqueParticipantsIds.map(userId => {
      const [userA, userB] = [creatorId.toString(), userId.toString()].sort();
      return { userA, userB };
    });

    const friendChecks = await Promise.all(
      friendPairs.map(pair => Friend.exists(pair))
    );

    if (friendChecks.some(isFriend => !isFriend)) {
      return res
        .status(400)
        .json({ message: 'Only friends can be added to conversation' });
    }

    let conversation;

    if (type === 'direct') {
      if (uniqueParticipantsIds.length !== 1) {
        return res.status(400).json({
          message: 'Direct conversation needs exactly one participant',
        });
      }

      const participantId = uniqueParticipantsIds[0];

      conversation = await Conversation.findOne({
        type: 'direct',
        'participant.userId': { $all: [creatorId, participantId] },
      }).populate('participant.userId', 'displayName');

      if (!conversation) {
        conversation = await Conversation.create({
          type: 'direct',
          participants: [
            { userId: creatorId, joinedAt: new Date() },
            { userId: participantId, joinedAt: new Date() },
          ],
          lastMessage: {
            _id: null,
            content: null,
            senderId: null,
            createdAt: null,
          },
          seenBy: [creatorId],
          unreadCount: {},
        });
      }
    }

    if (type === 'group') {
      if (!groupName) {
        return res.status(400).json({ message: 'Group name is required' });
      }

      const participants = [
        { userId: creatorId, joinedAt: new Date() },
        ...uniqueParticipantsIds.map(id => ({
          userId: id,
          joinedAt: new Date(),
        })),
      ];

      conversation = await Conversation.create({
        type: 'group',
        participants,
        group: {
          name: groupName,
          createdBy: creatorId,
        },
        lastMessage: {
          _id: null,
          content: null,
          senderId: null,
          createdAt: null,
        },
        seenBy: [creatorId],
        unreadCount: {},
      });
    }

    return res.status(201).json({
      message:
        type === 'group'
          ? 'Group created successfully'
          : 'Direct conversation ready',
      conversation,
    });
  } catch (error) {
    console.log('CREATE CONVERSATION ERROR:', error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Try cập vào danh sách participant.userId trong conversation để tìm kiếm theo userId
    const [conversations, total] = await Promise.all([
      Conversation.find({ 'participants.userId': userId })
        .populate('participants.userId', 'displayName avatarUrl')
        .populate('group.createdBy', 'displayName avatarUrl')
        .populate('lastMessage.senderId', 'displayName avatarUrl')
        .sort({ lastMessage: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments({ 'participants.userId': userId }),
    ]);

    return res.status(200).json({
      success: true,
      count: conversations.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
    });
  }
};
// Lấy tin nhắn trong 1 cuộc hội thoại
export const getMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = parseInt(req.query.skip) || 1;
    const userId = req.user._id;
    const { conversationId } = req.params;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    // Chỉ người dùng sở hữu cuộc trò chuyện đó mới lấy được message trong cuộc trò chuyện
    // Kiểm tra xem user có thuộc conversation này không
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId, // kiểm tra userId có trong participants không
    }).select('participants');

    if (!conversation) {
      return res.status(403).json({
        message: 'You do not have access to this conversation',
      });
    }

    // Lấy ra danh sách message nếu như userId thuộc conversation này
    const messages = await Message.find({
      conversationId: conversationId,
    })
      .populate('senderId', 'displayName avatarUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    // Reverse để messages mới nhất ở dưới

    const reversedMessages = messages.reverse();
    return res.status(200).json({
      success: true,
      count: reversedMessages.length,
      page,
      limit,
      messages: reversedMessages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
