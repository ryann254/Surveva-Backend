import { Router } from 'express';
import {
  forgotPasswordController,
  loginController,
  loginWithGoogleOrFacebookController,
  logoutController,
  refreshTokensController,
  registerController,
  resetPasswordController,
  sendVerificationEmailController,
  verifyEmailController,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/social', loginWithGoogleOrFacebookController);
router.post('/logout', logoutController);
router.post('/refresh-tokens', refreshTokensController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/send-verification-email', sendVerificationEmailController);
router.post('/verify-email', verifyEmailController);

export default router;
