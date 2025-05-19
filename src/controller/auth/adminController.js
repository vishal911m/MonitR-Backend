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

  //check if user exists
  

  

});