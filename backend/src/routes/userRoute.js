import e from 'express';
import { test, userInfo } from '../controllers/userController.js';

const router = e.Router();

router.get('/me', userInfo);
router.get('/test', test);

export default router;
