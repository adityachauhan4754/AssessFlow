import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (req, res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  const requestOrigin = req.headers.origin || '';
  const isCrossDomain = requestOrigin && !requestOrigin.includes('localhost');
  const isProd = process.env.NODE_ENV === 'production' || isCrossDomain;
  
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProd, // Must be true for cross-origin cookies
    sameSite: isProd ? 'none' : 'strict', // 'none' required for cross-domain auth
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export const registerUser = asyncHandler(async (req, res) => {
  const name = String(req.body.name);
  const email = String(req.body.email);
  const password = String(req.body.password);

  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const user = await User.create({ name, email, password });
  if (user) {
    const token = generateToken(req, res, user._id);
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email }, accessToken: token });
  } else {
    res.status(400); throw new Error('Invalid user data');
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email);
  const password = String(req.body.password);
  
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(req, res, user._id);
    res.json({ user: { _id: user._id, name: user.name, email: user.email }, accessToken: token });
  } else {
    res.status(401); throw new Error('Invalid email or password');
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || '';
  const isCrossDomain = !clientUrl.includes('localhost');
  const isProd = process.env.NODE_ENV === 'production' || isCrossDomain;
  
  res.cookie('jwt', '', { 
    httpOnly: true, 
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    expires: new Date(0) 
  });
  res.status(200).json({ message: 'Logged out successfully' });
});
