import { Router } from 'express';
import { check } from 'express-validator';

import rateLimit from '../middlewares/rate-limit.js';
import { login, signup } from '../controllers/user/auth.js'
// import authMiddleware from '../middlewares/authMiddleware.js';
// import roleBasedAccess from '../middlewares/role-based-access.js';


const router = Router()


router.post("/login", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ max: 6 }), rateLimit, login);

router.post("/signup", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ max: 6 }), rateLimit, signup);

// routes/webhook.js
// router.post('/webhook', paystackWebhook)





export default router;