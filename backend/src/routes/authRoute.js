import e from 'express';
import { signUp } from '../controllers/authController.js';
const router = e.Router();

router.post('/signup', signUp);
export default router;
