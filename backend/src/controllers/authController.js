import * as bcrypt from 'bcrypt';
import User from '../models/User.js';
import JWT from 'jsonwebtoken';
import Session from '../models/Session.js';
import crypto from 'crypto';
const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days
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

export const signIn = async (req, res) => {
  try {
    // Get input from request body
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: 'userName and password required' });
    }

    const user = await User.findOne({ userName });
    if (!user) {
      return res
        .status(401)
        .json({ message: 'userName or password incorrect' });
    }

    // Get hashPassword and compare body
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: 'username and password incorrect' });
    }
    // if correct, create accessToken with JWT
    const accessToken = JWT.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    // create refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');

    // create new session to save refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    //  return refresh token to cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // prevent access cookie by JS
      secure: true, // only access by HTTPS
      samesite: 'none', //backend, frontend single deployment
      maxAge: REFRESH_TOKEN_TTL,
    });
    // return access toekn at res
    return res.status(200).json({
      message: `User ${user?.displayName} was logged`,
      accessToken: accessToken,
    });
  } catch (error) {
    console.error('Error when call sign in', error);
    return res.status(500).json({
      message: 'Inernal Server Error',
    });
  }
};

export const logout = async (req, res) => {
  // get refresh token from cookies
  const token = req.cookies?.refreshToken;
  if (token) {
    // delete refresh token
    await Session.deleteOne({ refreshToken: token });
  }
  // delete cookie
  res.clearCookie('refreshToken');
  return res.sendStatus(204);
};
