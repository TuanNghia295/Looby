import e from 'express';
import { logout, signIn, signUp } from '../controllers/authController.js';
const router = e.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout', logout);
export default router;
