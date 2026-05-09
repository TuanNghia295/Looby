import e from 'express';
import { userInfo } from '../controllers/userController.js';

const router = e.Router();

router.get('/me', userInfo);

export default router;
