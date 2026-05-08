import * as bcrypt from 'bcrypt';
import User from '../models/User.js';
export const signUp = async (req, res) => {
  try {
    const { userName, password, email, firstName, lastName } = req.body;
    if (!userName || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message: 'userName, password, email, firstName, lastName are require',
      });
    }

    // Check user exist
    const userExist = await User.findOne({ userName });
    if (userExist) {
      return res.status(409).json({ message: 'User exist' });
    }

    // encode password
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    // create new user
    await User.create({
      userName,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    // return
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error when call sign up', error);
    return res.status(500).json({
      message: 'Inernal Server Error',
    });
  }
};
