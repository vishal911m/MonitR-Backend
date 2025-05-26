import asynchandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";

export const deleteUser = asynchandler(async (req, res) => {
  // res.status(200).json({
  //   message: "User deleted successfully",
  // });
  const { id } = req.params;

  try {
    //attempt to find and delete the user
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    // 404 not found
    //check if user exists
    res.status(404).json({ message: "User not found" });
  }

  //delete the user
  res.status(200).json({
    message: "User deleted successfully",
  });
  } catch (error) {
    res.status(500).json({
      message: "Cannot delete user",
    });
  } 
});

//get all users
export const getAllUsers = asynchandler(async (req, res) => {
  
  try {
    const users = await User.find({});
    
    if(!users){
    res.status(404).json({message: "No users found"});
  }

  res.status(200).json(users);
  } catch (error) {
    res.status(500).json({message: "Cannot get users"});
  }
});