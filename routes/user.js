import { Router } from 'express';
import { check } from 'express-validator';

import rateLimit from '../middlewares/rate-limit.js';
import { login, signup } from '../controllers/user/auth.js'
import paystackWebhook from '../util/webhook.js';
import authMiddleware from '../middlewares/authMiddleware.js';
// import roleBasedAccess from '../middlewares/role-based-access.js';


const router = Router()


router.post("/login", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ max: 6 }), rateLimit, login);

router.post("/signup", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ max: 6 }), rateLimit, signup);

router.get("/bank/details", authMiddleware, getUserBankDetails); //add controller

// routes/webhook.js
router.post('/webhook', paystackWebhook)

router.post("/transfer/another/user", check("amount").notEmpty(), 
    check("bankName").notEmpty().isString().isLength({ min: 3 }), 
    check("accountNumber").notEmpty().isLength({ min: 6 }), 
    check("accountName").notEmpty().isString().isLength({ min: 5 }), authMiddleware, transfer) //add controller

router.post("/buy/airtime", check("amount").notEmpty(), 
    check("network").notEmpty().isString(), authMiddleware, buyAirtime); //add controller

router.post("/buy/data/subscription", check("amount").notEmpty(), 
    check("network").notEmpty().isString(), authMiddleware, buyDataSubscription); //add controller

router.post("/pay/gotv/subscription", check("amount").notEmpty(), authMiddleware, gotvSubscription); //add controller

router.post("/pay/dstv/subscription", check("amount").notEmpty(), authMiddleware, dstvSubscription); //add controller

router.post("/pay/electricity/bill", check("amount").notEmpty(), authMiddleware, electricityBill); //add controller

// router.get("/reward", authMiddleware, reward);
router.get("/profile", authMiddleware, getProfile); //add controller

router.post("/history", authMiddleware, transactionHistory); //add controller



export default router;