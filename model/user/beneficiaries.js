import mongoose from "mongoose";


const beneficiariesSchema = new mongoose.Schema({
    billQuickTransferBeneficiary: [{  //this app name just like opay.
        fullName: { type: String, trim: true },
        bankName: { type: String, trim: true },
        accountNumber: { type: Number, trim: true },
        date: { type: Date }
    }],
    otherBankTransferBeneficiary: [{
        fullName: { type: String, trim: true },
        bankName: { type: String, trim: true },
        accountNumber: { type: Number, trim: true },
        date: { type: Date }
    }],
    topupTransferBeneficiary: [{
        amount: { type: String, trim: true },
        network: { type: String, trim: true },
        dataBundle: { type: String, trim: true }, //this is for data bundle subscription.
        phoneNumber: { type: Number, trim: true },
        date: { type: Date }
    }],
    tvTransferBeneficiary: [{
        amount: { type: String, trim: true },
        networkName: { type: String, trim: true }, //either gotv or dstv or startime.
        accountName: { type: String, trim: true }, //this for the tv full name.
        accountNumber: { type: Number, trim: true },  //this for smartcard number. i.e IU number.
        date: { type: Date }
    }],
    creatorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users" }
})


const beneficiariesModel = mongoose.model("Beneficiaries", beneficiariesSchema)


export default beneficiariesModel;