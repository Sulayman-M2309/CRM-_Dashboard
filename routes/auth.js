import express from 'express';
import { login,signup, VerifyOtpController } from '../controllers/authController.js';

const router= express.Router();
router.post('/login', login)
router.post('/signup', signup )
router.post('/verify-otp',VerifyOtpController)
export default router;
