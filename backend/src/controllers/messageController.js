import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { updateConversationAfterCreateMessage } from '../utils/messageHelper.js';
import Friend from '../models/Friend.js';
export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id;

    let conversation;

    if (!content) {
      return res.status(400).json({ message: 'Miss content' });
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversationId) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [
          {
            userId: senderId,
            joinedAt: new Date(),
          },
          {
            userId: recipientId,
            joinedAt: new Date(),
          },
        ],
        lastMessageAt: new Date(),
        unreadCount: new Map(),
      });
    }

    //   Có cuộc trò chuyện rồi thì tiến hành tạo tin nhắn mới
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: senderId,
      content: content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    return res.status(201).json({ message });
  } catch (error) {
    console.error('Error when sent message.', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// create group
export const createGroup = async (req, res) => {
  try {
    // 2 trường hợp: Bản thân tự tạo cuộc trò chuyện, được bạn bè thêm vào cuộc trò chuyện
    const { nameGroup, participantIds } = req.body;
    const creatorId = req.user._id;

    if (!nameGroup) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!Array.isArray(participantIds)) {
      return res.status(400).json({ message: 'participantIds must be array' });
    }

    if (participantIds.length === 0) {
      return res
        .status(400)
        .json({ message: 'Please add at least one participant' });
    }
    // Remove duplicate ParicipantsId by using Set in JS and remove creatorId
    // Set:là một cấu trúc dữ liệu đặc biệt cho phép lưu trữ tập hợp các giá trị duy nhất (không trùng lặp)
    // bất kể kiểu dữ liệu nào (nguyên thủy hoặc object)
    const uniqueParticipantsIds = [
      ...new Set(
        participantIds.filter(id => id.toString() !== creatorId.toString())
      ),
    ];

    // Validate objectId
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
      return res.status(400).json({ message: 'Only friends can be added to group' });
    }

    const participants = [
      {
        userId: creatorId,
        joinedAt: new Date(),
      },
      ...uniqueParticipantsIds.map(id => ({
        userId: id,
        joinedAt: new Date(),
      })),
    ];

    const conversation = await Conversation.create({
      type: 'group',
      participants,
      group: {
        name: nameGroup,
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

    return res.status(201).json({
      message: 'Group created successfully',
      conversation,
    });
  } catch (error) {
    console.log('CREATE GROUP ERROR:', error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const sendGroupMessage = async (req, res) => {
  // 1. Hành động tạo group (Tạo cuộc trò chuyện)
  // 2. Thêm bạn bè vào group (participantId)
  // 3. Tạo tin nhắn và gửi vào group
};
