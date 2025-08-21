import { Router } from 'express';
import { check } from 'express-validator';

import rateLimit from '../middlewares/rate-limit.js';
import { login, signup } from '../controllers/user/auth.js'
import paystackWebhook from '../util/webhook.js';
import authMiddleware from '../middlewares/authMiddleware.js';
// import roleBasedAccess from '../middlewares/role-based-access.js';
import { transfer } from '../controllers/user/transfer.js';
import { getProfile, getUserBankDetails, getUserData } from '../controllers/user/get.details.js'
import { buyAirtimeSubscription, buyDataSubscription, gotvSubscription, 
    dstvSubscription, electricityBillSubscription} from '../controllers/user/subscription.js'
import { allTransactionHistory, fundsTransactionHistory, 
    networkTransactionHistory, tvTransactionHistory } from '../controllers/user/transactionshistory.js'
import { verifyEmailByOTP } from '../controllers/user/security.js'


const router = Router();


router.post("/signup", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ min: 6 }), rateLimit, signup); //passed

router.post("/login", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ min: 6 }), rateLimit, login); //passed

router.get("/get/personal/data/:userId", 
    check("userId").notEmpty().isLength({ min: 6 }), authMiddleware, getUserData)

router.post("/verify/email/otp/:userId", check("otpCode").notEmpty(), 
    rateLimit, authMiddleware, verifyEmailByOTP);   //passed
    
// routes/webhook.js 
router.post('/webhook', paystackWebhook)

router.post("/transfer/another/user", check("amount").notEmpty(), 
    check("bankName").notEmpty().isString().isLength({ min: 3 }), 
    check("accountNumber").notEmpty().isLength({ min: 6 }), 
    check("accountName").notEmpty().isString().isLength({ min: 5 }), authMiddleware, transfer)

router.post("/buy/airtime", check("amount").notEmpty(), 
    check("network").notEmpty().isString(), authMiddleware, buyAirtimeSubscription); 

router.post("/buy/data/subscription", check("amount").notEmpty(), 
    check("network").notEmpty().isString(), authMiddleware, buyDataSubscription); 

router.post("/pay/gotv/subscription", check("amount").notEmpty(), authMiddleware, gotvSubscription); 

router.post("/pay/dstv/subscription", check("amount").notEmpty(), authMiddleware, dstvSubscription);

router.post("/pay/electricity/bill", check("amount").notEmpty(), authMiddleware, electricityBillSubscription);

router.get("/bank/details", authMiddleware, getUserBankDetails);

// router.get("/reward", authMiddleware, reward);

router.get("/profile", authMiddleware, getProfile);

router.post("/all/history", authMiddleware, allTransactionHistory);

router.post("/credit/debit/history", authMiddleware, fundsTransactionHistory);

router.post("/airtime/data/history", authMiddleware, networkTransactionHistory);

router.post("/Tv/history", authMiddleware, tvTransactionHistory);

//add other routes here

export default router;