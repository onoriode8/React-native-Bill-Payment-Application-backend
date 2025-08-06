import express from 'express';
import crypto from'crypto';
import User from'../model/user/user.js';
// import Admin from'../model/Admin';



const paystackWebhook = async (req, res, next) => {
    let rawBody;
    express.json({ verify: (req, res, buf) => {
            req.rawBody = buf;
            rawBody = req.rawBody;
        }
    })
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(req.rawBody).digest('hex'); //change to rawBody on req.rawBody update function.

    if (hash !== req.headers['x-paystack-signature']) {
        return res.sendStatus(401); // unauthorized
    } 

    const event = req.body; 

    if (event.event === "charge.success" && event.data.channel === "dedicated_nuban") {
        const customerCode = event.data.customer.customer_code;
        const grossAmount = event.data.amount / 100;

        const user = await User.findOne({ paystackCustomerCode: customerCode });
        if (!user) return res.sendStatus(404);

        const FEE = 10;
        const netAmount = grossAmount - FEE;

        // Credit user wallet
        await User.updateOne({ _id: user._id }, {
            $inc: { walletBalance: netAmount }
        });

        // Credit your admin earnings
        await Admin.updateOne({}, { $inc: { totalEarnings: FEE } }, { upsert: true });

        return res.sendStatus(200);
    }

    res.sendStatus(200);
};


export default paystackWebhook;