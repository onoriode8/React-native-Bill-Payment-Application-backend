import { Router } from 'express';
import { check, body } from 'express-validator';

import rateLimit from '../middlewares/rate-limit.js';
import { login, signup } from '../controllers/user/auth.js'
import paystackWebhook from '../util/webhook.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleBasedAccess from '../middlewares/role-based-access.js';
import { transfer, getBillQuickUser, transferToBillQuickUser, getRecipientBankDetails } from '../controllers/user/transfer.js';
import { getProfile, getUserBankDetails, getUserData } from '../controllers/user/get.details.js'
import { buyAirtimeSubscription, buyDataSubscription, gotvSubscription, 
    dstvSubscription, electricityBillSubscription} from '../controllers/user/subscription.js'
import { allTransactionHistory, fundsTransactionHistory, 
    networkTransactionHistory, tvTransactionHistory } from '../controllers/user/transactionshistory.js'
import { verifyEmailByOTP, verifyCodeByEmail, sendEmailToResetPassword, resetPassword } from '../controllers/user/security.js'
import { createPaymentPin, verifyUserPaymentPin, ResetPaymentPin, changePaymentPin } from '../controllers/user/pins.js';
import { changeAppPassword, ResetAppPassword } from '../controllers/user/app-password.js';



const router = Router();


router.post("/signup", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ min: 6 }), rateLimit, signup); //passed

router.post("/login", check("email").notEmpty().isEmail().normalizeEmail(), 
    check("password").isLength({ min: 6 }), rateLimit, login); //passed

router.get("/get/personal/data/:userId", 
    authMiddleware, roleBasedAccess(["User", "Admin"]), getUserData) //passed

router.post("/verify/email/otp/:userId", check("otpCode").notEmpty(), 
    rateLimit, authMiddleware, roleBasedAccess(["User", "Admin"]), verifyEmailByOTP); //passed

router.post("/forgot/password", check("email").notEmpty().isEmail().normalizeEmail(),
    rateLimit, sendEmailToResetPassword);  //passed
    
router.post("/email/verify/code", check("otpCode").notEmpty(),
    check("email").notEmpty().isEmail().normalizeEmail(),
    rateLimit, verifyCodeByEmail); //passed

router.patch("/reset/password", check("password").notEmpty().isLength({ min: 8 }),
    check("confirmPassword").notEmpty().isLength({ min: 8 }),
    check("email").notEmpty().isEmail().normalizeEmail(), 
    rateLimit, resetPassword); //passed

// routes/webhook.js 
router.post('/webhook', paystackWebhook)

//bank transfer route below
router.post('/get/bill/quick/user/bank/details/:id', 
    check("recipientAccountNumber").notEmpty().isLength(10),
    check("recipientBank").notEmpty().isString().isLength(9),
    authMiddleware, roleBasedAccess(["User"]), getBillQuickUser);

router.post('/send/funds/to/bill/quick/user/:id', 
    check("recipientAccountNumber").notEmpty().isLength(10),
    authMiddleware, roleBasedAccess(["User"]), transferToBillQuickUser);

router.post('/get/recipient/bank/name/:id', 
    check("recipientAccountNumber").notEmpty().isLength(10),
    authMiddleware, roleBasedAccess(["User"]), getRecipientBankDetails);

//Transfer route ends here.
router.post("/transfer/another/user/:id", body("amount").notEmpty(), //.isNumber(),  
    check("recipientBank").notEmpty().isString().isLength({ min: 4 }),
    check("recipientName").notEmpty().isLength({ min: 6 }), //.isNumber()
    check("recipientAccountNumber").notEmpty().isLength(10), //.isNumber()
    authMiddleware, roleBasedAccess(["User"]), transfer);

router.post("/buy/airtime", check("amount").notEmpty(), 
    check("network").notEmpty().isString(), authMiddleware, roleBasedAccess(["User"]), buyAirtimeSubscription); 

router.post("/buy/data/subscription", check("amount").notEmpty(), 
    check("network").notEmpty().isString(), authMiddleware, roleBasedAccess(["User"]), buyDataSubscription); 

router.post("/pay/gotv/subscription", check("amount").notEmpty(), authMiddleware, roleBasedAccess(["User"]), gotvSubscription); 

router.post("/pay/dstv/subscription", check("amount").notEmpty(), authMiddleware, roleBasedAccess(["User"]), dstvSubscription);

router.post("/pay/electricity/bill", check("amount").notEmpty(), authMiddleware, roleBasedAccess(["User"]), electricityBillSubscription);

router.get("/bank/details/:id", authMiddleware, roleBasedAccess(["User"]), getUserBankDetails); //passed

// router.get("/reward", authMiddleware, reward);

router.get("/profile/:id", authMiddleware, roleBasedAccess(["User"]), getProfile); //passed

router.get("/all/history/:id", authMiddleware, roleBasedAccess(["User"]), allTransactionHistory);

router.get("/credit/debit/history/:id", authMiddleware, roleBasedAccess(["User"]), fundsTransactionHistory); //check for complete.

router.get("/airtime/data/history/:id", authMiddleware, roleBasedAccess(["User"]), networkTransactionHistory);

router.get("/tv/history/:id", authMiddleware, roleBasedAccess(["User"]), tvTransactionHistory);

router.patch("/create/new/payment/pin/:userId", rateLimit, check("newPaymentPin").notEmpty(), authMiddleware, roleBasedAccess(["User"]), createPaymentPin);//passed

router.post("/verify/payment/pin/:userId", rateLimit, authMiddleware, roleBasedAccess(["User"]), verifyUserPaymentPin); //passed.

router.patch("/reset/payment/pin/:userId", rateLimit,
    check("formattedNewPaymentPin").notEmpty().isLength({ min: 4 }),
    check("formattedConfirmedPaymentPin").notEmpty().isLength({ min: 4 }),
    authMiddleware, roleBasedAccess(["User"]), ResetPaymentPin); //passed.

router.patch("/change/payment/pin/:userId", rateLimit, 
    check("formattedOldPaymentPin").notEmpty().isLength({ min: 4 }),
    check("formattedNewPaymentPin").notEmpty().isLength({ min: 4 }),
    check("formattedConfirmedPaymentPin").notEmpty().isLength({ min: 4 }),
    authMiddleware, roleBasedAccess(["User"]), changePaymentPin);

//change password inside app
router.patch("/change/app/password/:userId", rateLimit,
    check("oldAppPassword").notEmpty().isLength({ min: 6 }), 
    check("newAppPassword").notEmpty().isLength({ min: 6 }), 
    check("confirmedAppPassword").notEmpty().isLength({ min: 6 }),
    authMiddleware, roleBasedAccess(["User"]), changeAppPassword);

//reset app password inside app
router.patch("/reset/app/password/:userId", rateLimit,
    check("newAppPassword").notEmpty().isLength({ min: 6 }), 
    check("confirmedAppPassword").notEmpty().isLength({ min: 6 }),
    authMiddleware, roleBasedAccess(["User"]), ResetAppPassword);

//add other routes here

export default router;