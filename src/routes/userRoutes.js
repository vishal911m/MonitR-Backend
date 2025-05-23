import express from 'express';
import { forgotPassword, getUser, loginUser, logoutUser, registerUser, resetPassword, updateUser, userLoginStatus, verifyEmail, verifyUser } from '../controller/auth/userController.js';
import { adminMiddleware, creatorMiddleware, protect } from '../middleware/authMiddleware.js';
import { deleteUser, getAllUsers } from '../controller/auth/adminController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello from the user routes!');
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);

//admin route
router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);

//get all users
router.get("/admin/users", protect, creatorMiddleware, getAllUsers);

//login status
router.get("/login-status", userLoginStatus);

//email verification by node mailer
router.post("/verify-email", protect, verifyEmail);

//verify user --> email verification
router.post("/verify-user/:verificationToken", verifyUser);

//forgot password
router.post("/forgot-password", forgotPassword);

//reset password
router.post("/reset-password/:resetPasswordToken", resetPassword);

export default router;