import { Router } from 'express';
import { check } from 'express-validator';

import rateLimit from '../middlewares/rate-limit.js';
import { login, signup } from '../controllers/user/auth.js'
import authMiddleware from '../middlewares/authMiddleware.js';
import roleBasedAccess from '../middlewares/role-based-access.js';
import { getAllUsers, getUserBankDetails } from '../controllers/admin/get.user.details.js'
import { allUserTransactionHistory } from '../controllers/admin/transaction.js';


const router = Router()


router.post("/login", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ max: 6 }), rateLimit, login);

router.post("/signup", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ max: 6 }), rateLimit, signup);

// routes/webhook.js
// router.post('/webhook', paystackWebhook)

router.get("/bank/details/:id", authMiddleware, roleBasedAccess(["Admin"]), getUserBankDetails);

router.get("/get-all-users", authMiddleware, roleBasedAccess(["Admin"]), getAllUsers)

router.get("/all/history/:id", authMiddleware, roleBasedAccess(["Admin"]), allUserTransactionHistory);


export default router;