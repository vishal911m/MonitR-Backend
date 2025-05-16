import express from 'express';
import { loginUser, registerUser } from '../controller/auth/userController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello from the user routes!');
});

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;