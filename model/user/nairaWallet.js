import mongoose from 'mongoose'


const userNairaWalletSchema = new mongoose.Schema({
    balance: { type: Number, default: 0 }, //change to virtualBalance
    TotalFunds: [{
        moneyIn: { type: Number }, //money received in a month
        moneyOut:{ type: Number }, //money spent in a month
    }],
    paystackCustomerCode: { type: Number, required: true, trim: true, unique: true },
    paystackVirtualAccount: {
        bankName: { type: String, required: true, trim: true },
        reference: { type: String, required: true, trim: true },
        accountName: { type: String, required: true, trim: true },
        accountNumber: { type: Number, required: true, trim: true, length: 10,  unique: true },
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users"}
})


const userNairaWalletModel = mongoose.model("NairaWallet", userNairaWalletSchema)



export default userNairaWalletModel;