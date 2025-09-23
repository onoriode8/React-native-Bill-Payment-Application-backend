import mongoose from "mongoose";


const securitySchema = new mongoose({
    paymentPin: { type: Number, required: true, trim: true  },
    MFA: [{
        baseCode: { type: String, required: true, trim: true },
        secretKey: { type: String, required: true, trim: true },
        // secretKey: { type: String, required: true, trim: true }
    }],
    passkey: [{

    }],
    faceId: [{

    }],
    creatorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users"}
});


const securityModel = mongoose.model("Security", securitySchema)


export default securityModel;