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
        return res
          .status(400)
          .json({ message: 'Direct conversation needs exactly one participant' });
      }

      const participantId = uniqueParticipantsIds[0];

      conversation = await Conversation.findOne({
        type: 'direct',
        'participants.userId': { $all: [creatorId, participantId] },
      });

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

export const getConversations = async (req, res) => {};

export const getMessages = async (req, res) => {};
