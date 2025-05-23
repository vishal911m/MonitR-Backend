import asyncHandler from 'express-async-handler';
import User from '../../models/auth/UserModel.js';
import generateToken from '../../helpers/generateToken.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Token from '../../models/auth/Token.js';
import crypto from 'node:crypto';
import hashToken from '../../helpers/hashToken.js';
import sendEmail from '../../helpers/sendEmail.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //validation 
  if (!name || !email || !password) {
    // 400 bad request
    res.status(400).json({message: "All fields are required"});
    throw new Error("Please fill all the fields");
  }
  //check password length
  if (password.length < 6) {
    return res
    .status(400)
    .json({message: "Password must be at least 6 characters"});
    throw new Error("Password must be at least 6 characters");
  }

  //check if user already exists
  const userExists = await User.findOne({email});
  console.log(userExists);
  if (userExists) {
    //bad request
    res.status(400).json({message: "User already exists"});
    throw new Error("User already exists");
  }

  //create user
  const user = await User.create({
    name,
    email,
    password,
  });

  //generate token with user id
  const token = generateToken(user._id);

  //send back the user and token in the response to the client
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: true,
    secure: true, // set to true if using https
  });

  if (user) {
    const { _id, name, email, role, photo, bio, isVerified} = user;
    // 201 created
    res.status(201).json({
      _id,
      name,
      email,
      photo,
      bio,
      role,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({message: "Invalid user data"});
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  // res.send("Login Route");
  //get email and password from the req.body
  const { email, password } = req.body;

  //validation
  if (!email || !password) {
    // 400 bad request
    res.status(400).json({message: "All fields are required"});
    throw new Error("Please fill all the fields");
  }

  //check if user exists
  const userExists = await User.findOne({email});
  if (!userExists) {
    //bad request
    res.status(400).json({message: "User not found, signup instead"});
    throw new Error("User does not exist");
  }

  //check if the password matches the hashed password in the database
  const isMatch = await bcrypt.compare(password, userExists.password);

  if (!isMatch) {
    //bad request
    return res.status(400).json({message: "Invalid credentials"});
    throw new Error("Invalid credentials");
  }

  //generate token with user id
  const token = generateToken(userExists._id);

  if (userExists && isMatch) {
    const { _id, name, email, role, photo, bio, isVerified} = userExists;
    // 201 created
    //set the token in a cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true, 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: true,
      secure: true, // set to true if using https
    });

    //send back the user and token in the response to the client
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      bio,
      role,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({message: "Invalid email or password"});
  }
});

//logout user
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({message: "User logged out successfully"});
});

//get user
export const getUser = asyncHandler(async (req, res) => {
  //get the user details from the token --> exclude password
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({message: "User not found"});
  }
});

//update user
export const updateUser = asyncHandler(async (req, res) => {
  //get user details from the token --> protect middleware
  const user = await User.findById(req.user._id).select("-password");

  if(user){
    //user properties to be updated
    const { name, email, photo, bio } = req.body;
    //update user properties
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.photo = req.body.photo || user.photo;

    const updated = await user.save();

    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      photo: updated.photo,
      bio: updated.bio,
      role: updated.role,
      isVerified: updated.isVerified,
    });
  } else {
    res.status(404).json({message: "User not found"});
  }
});

//login status 
export const userLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    //401 unauthorized
    return res.status(401).json({message: "Not authorized, please login!"});
  }

  //verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

//email verification 
export const verifyEmail = asyncHandler(async (req,res) => {
  const user = await User.findById(req.user._id);

  //if user exists
  if(!user){
    return res.status(404).json({message: "User not found"});
  }

  //check if user is already verified
  if(user.isVerified){
    return res.status(400).json({message: "User is already verified"});
  }

  let token = await Token.findOne({userId: user._id});

  //if token exists --> update the token
  if(token){
    await token.deleteOne();
  }

  //create a verification token using the user id --> crypto 
  const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;

  //hash the verification token
  const hashedToken = await hashToken(verificationToken);

  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }).save();

  //verification link 
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  //send email
  const subject = "Email verification - AuthKit";
  const send_to = user.email;
  const reply_to = "noreply@gmail.com";
  const template = "emailVerification";
  const send_from = process.env.USER_EMAIL;
  const name = user.name;
  const link = verificationLink;

  try {
    await sendEmail(subject, send_from, reply_to, template, name, link);
    // await sendEmail(subject, send_from, send_from, reply_to, name, template, link);
    return res.status(200).json({message: "Email sent"});
  } catch (error) {
    console.log("Error sending email: ",error);
    return res.status(500).json({message: "Email could not be sent"});
  }
 });

 //verify user
 export const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.status(400).json({message: "Invalid or expired token"});
  }
  //hash the verification token --> because it was hashed before saving
  const hashedToken = hashToken(verificationToken);

  //find user with the verification token
  const userToken = await Token.findOne({
    verificationToken: hashedToken,
    //check if the token has not expired
    expiresAt: {$gt: Date.now()},
  });

  // console.log(userToken);
  if (!userToken) {
    return res
    .status(400)
    .json({message: "Invalid or expired verification token"});
  }

  //find user with the user id in the token
  const user = await User.findById(userToken.userId);

  if(user.isVerified){
    //400 bad request
    return res.status(400).json({message: "User is already verified"});
  } 

  //update user to verified
  user.isVerified = true;
  await user.save();
  res.status(200).json({message: "User verified successfully"});
 });

 //forgot password
 export const forgotPassword = asyncHandler(async (req, res) => {
  // res.send("Forgot password route");
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({message: "Email is required"});
  }

  //check if the user exists
  const user = await User.findOne({email});

  if (!user) {
    //404 not found
    return res.status(400).json({message: "User not found"});
  }

  //see if the reset token exists
  let token = await Token.findOne({userId: user._id});

  //if token exists --> delete the token
  if(token) {
    await token.deleteOne();
  }

  //create a reset token using user id --> expires in 1 hour
  const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;

  //hash the reset token 
  const hashedToken = await hashToken(passwordResetToken);

  await new Token({
    userId: user._id,
    passwordResetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  }).save();

  //reset link
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

  //send email to user
  const subject = "Password reset - AuthKit";
  const send_to = user.email;
  const send_from = process.env.USER_EMAIL;
  const reply_to = "noreply@noreply.com";
  const template = "forgotPassword";
  const name = user.name;
  const url=resetLink;
  
  try {
    await sendEmail(subject, send_from, reply_to, template, name, url);
    res.json({message: "Email sent"});
  } catch (error) {
    console.log("Error sending email: ",error);
    return res.status(500).json({message: "Email could not be sent"});
  }
 });

 //reset password
 export const resetPassword = asyncHandler(async (req, res) => {
  // res.send("Reset password route");

  const { resetPasswordToken } = req.params;
  const { password } = req.body;

  if(!password){
    return res.status(400).json({message: "Password is required"});
  }

  //hash the reset token
  const hashedToken = hashToken(resetPasswordToken);

  //check if the token exists and has not expired
  const userToken = await Token.findOne({
    passwordResetToken: hashedToken,
    //check if the token has not expired
    expiresAt: {$gt: Date.now()},
  });

  if (!userToken) {
    return res.status(400).json({message: "Invalid or expired password reset token"});
  }

  //find user with the user id in the token
  const user = await User.findById(userToken.userId);

  //update user password
  user.password = password;
  await user.save();

  res.status(200).json({message: "Password reset successfully"});
 });