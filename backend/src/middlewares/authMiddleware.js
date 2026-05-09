import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// authorization - Xác minh user là ai
export const protectedRoute = (req, res, next) => {
  try {
    // get accessToken from header when user send
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    // Verify token
    if (!token) {
      return res.status(401).json({ message: 'Access token not found' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decodeUser) => {
      if (err) {
        console.error(err);
        return res
          .status(403)
          .json({ message: 'Access token expired or not match' });
      }

      // Search user
      const user = await User.findById(decodeUser.userId).select(
        '-hashedPassword'
      ); // get all user info except hashedPassword

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // return user info in req
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error when authorization JWT in middleware', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
