import e from 'express';
import {
  logout,
  refreshToken,
  signIn,
  signUp,
} from '../controllers/authController.js';
const router = e.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
export default router;
