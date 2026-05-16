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

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content) {
      return res.status(400).json('Missing content');
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(201).json({ message });
  } catch (error) {
    console.log('ERROR when sent group message', error);
    return res.status(500).json('Internal server error');
  }
};
