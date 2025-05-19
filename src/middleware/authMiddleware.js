import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/auth/UserModel.js';

export const protect = asyncHandler(async (req, res, next) => {
  try {
    //check if user is logged in
    const token = req.cookies.token;

    if (!token) {
      // 401 unauthorized
      res.status(401).json({ message: 'Not authorized, please login!' });
    }

    //verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    //get the user details from the token -> exclude password
    const user = await User.findById(decoded.id).select('-password');

    //check if user exists
    if (!user) {
      // 401 unauthorized
      res.status(404).json({ message: 'User not found!' });
    }

    //set user details in the request object
    //the user becomes available in the request object
    req.user = user;

    next();
  } catch (error) {
    //401 unauthorized
    res.status(401).json({ message: 'Not authorized, token failed!' });
  }
});

//admin middleware
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    //if user is admin, go to the next middleware/controller
    return next();
  }
  //if user is not admin, send 403 forbidden --> terminate the request
  res.status(403).json({ message: 'Only admins can do this' });
});