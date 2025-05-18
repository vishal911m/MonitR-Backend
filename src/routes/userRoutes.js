import express from 'express';
import { getUser, loginUser, logoutUser, registerUser, updateUser } from '../controller/auth/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello from the user routes!');
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);

export default router;