import Friend from '../models/Friend.js';
import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = req.user._id;

    if (from === to) {
      return res
        .status(400)
        .json({ message: 'Can not send request for yourself' });
    }

    const userExist = await User.exists({ _id: to });
    if (!userExist) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Kiểm tra xem đã là bạn bè hoặc có lời mời đang chờ chưa
    // Đây là một thủ thuật (trick) để nhất quán hóa dữ liệu đầu vào,
    // giúp logic xử lý phía sau (như lưu Database) không bị nhân đôi hoặc sai lệch
    let userA = from.toString();
    let userB = to.toString();
    if (userA > userB) {
      // Dùng cú pháp phân rã (destructuring) để hoán đổi giá trị nếu userA lớn hơn userB
      [userA, userB] = [userB, userA];
    }

    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      // Kiểm tra coi 1 trong 2 đã gửi lời mời kết bạn chưa. Bất kể là ai gửi trước
      FriendRequest.findOne({
        $or: [
          { from, to },
          { to, from },
        ],
      }),
    ]);

    if (alreadyFriends) {
      return res.status(400).json({ message: 'Were friend' });
    }
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: 'The request has been submitted.' });
    }

    const request = await FriendRequest.create({
      from,
      to,
      message,
    });

    return res
      .status(200)
      .json({ message: 'Sent request successfully', request });
  } catch (error) {
    console.error('Add friend failed', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    // Lấy requestId từ params
    const { requestId } = req.params;

    const userId = req.user._id;

    // Tìm lời mời kết bạn xem có không
    const request = await FriendRequest.findById(requestId);
    console.log('RESSS', request);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Đảm bảo chỉ người nhận được quyền chấp nhận
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You don't have permission to accpet this request" });
    }

    // Tạo quan hệ bạn bè mới
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    // Tạo xong rồi thì xóa request đó đi
    await FriendRequest.findByIdAndDelete(requestId);

    // lean: Tối ưu hiệu năng query. Dữ liệu trả về là JS object thay vì mongoose document
    const from = await User.findById(request.from)
      .select('_id displayName avatarUrl')
      .lean();
    return res.status(200).json({
      message: 'Accept request successfully',
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avaterUrl,
      },
    });
  } catch (error) {
    console.error('Accept Request failed', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Từ chối lời mời kết bạn
export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    const userExist = await User.findById({ userId: requestId });

    // Tìm xem có lời mời kết bạn không
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (!userExist) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Không cho người khác từ chối lời mời này ngoài người được gửi
    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You don't have permission to decline this request.",
      });
    }

    // Không cho gửi yêu cầu decline tới chính mình
    if (requestId.toString() === userId.toString()) {
      return res.status(403).json({ message: 'User can not decline yourself' });
    }

    // Tiến hành từ chối lời mời
    const declineFriend = await Friend.deleteOne({
      userA: userId,
      userB: requestId,
    });

    // Xong rồi thì xóa request
    await FriendRequest.findByIdAndDelete(requestId);
    return res.sendStatus(204);
  } catch (error) {
    console.error('Decline friend failed', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Danh sach ban be
export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const friendList = await Friend.find({
      $or: [
        {
          userA: userId,
        },
        {
          userB: userId,
        },
      ],
    })
      .populate('userA', '_id userName displayName avatarUrl')
      .populate('userB', '_id userName displayName avatarUrl')
      .lean();

    if (!friendList.length) {
      return res.status(200).json({ friends: [] });
    }

    // Lấy ra những người bạn từ friend ship
    const friends = friendList.map(f =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA
    );

    return res.status(200).json({ friends });
  } catch (error) {
    console.error('Get all friend failed', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Danh sách yêu cầu kết bạn đã gửi và nhận
export const getFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;

    const populateFields = '_id userName displayName avatarUrl';

    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userId }).populate('to', populateFields),
      FriendRequest.find({ to: userId }).populate('from', populateFields),
    ]);

    res.status(200).json({ sent, received });
  } catch (error) {
    console.error('Get friend request failed', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
