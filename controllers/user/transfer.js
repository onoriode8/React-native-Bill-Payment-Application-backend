import Users from "../../model/user/user";
import { withdrawFundsFromVirtualAccount } from "../../util/paystack";



export const transfer = async (req, res) => {
    const { amount, bankName, accountNumber, accountName } = req.body
    const result = validationResult(req)
    if(!result.isEmpty()) {
        for(const error of result) {
            console.log("FOR", error)
            return res.status(422).json("Invalid value passed")
        }
    }

    if(!req.user.userId) {
        return res.status(400).json("Not allowed.");
    }

    let user;
    try {
        user = await Users.findById(req.user.userId);
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Internal Server Error")
    }

    const {} = withdrawFundsFromVirtualAccount()

    return res.status(200).json("Tranfer sent to beneficiary account.")
}