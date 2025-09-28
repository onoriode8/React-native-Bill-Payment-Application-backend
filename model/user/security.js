import mongoose from "mongoose";


const securitySchema = new mongoose.Schema({
    paymentPin: { type: String, required: true, trim: true  },
    MFA: [{
        baseCode: { type: String, trim: true },
        secretKey: { type: String, trim: true },
    }],
    // passkey: [{

    // }],
    // faceId: [{

    // }],
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
});


const securityModel = mongoose.model("Security", securitySchema)


export default securityModel;