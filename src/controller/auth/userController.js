import asyncHandler from 'express-async-handler';
import User from '../../models/auth/UserModel.js';
import generateToken from '../../helpers/generateToken.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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