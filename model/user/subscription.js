import mongoose from 'mongoose'



const subscriptionSchema = new mongoose.Schema({
    amount: { type: Number, required: true, trim: true },
    network: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true, trim: true },
    smartCardNumber: { type: Number, trim: true },
})


const subscriptionModel = mongoose.model("Subscription", subscriptionSchema)


export default subscriptionModel;