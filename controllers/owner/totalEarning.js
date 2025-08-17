import OwnerModel from "../../model/owner/ownerModel.js"



export const totalEarnings = async (req, res) => {
    try {
        const owner = await OwnerModel.findById()
        if(!owner) return res.status(404).json("User not found.")
            //add other logic before returning total earnings.
        return res.status(200).json(owner.totalEarnings)
    } catch (error) {
        return res.status(500).json("Internal Server Error.")
    }
}