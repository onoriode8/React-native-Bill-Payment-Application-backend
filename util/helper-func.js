import Users from '../model/user/user.js'



export const fetchUserDataHelper = async(authUserId, userId) => {
    let user;
    try {
        user = await Users.findById(authUserId);
        if(!user) return res.status(404).json("User not found.")
    } catch (error) {
        return res.status(500).json("Something went wrong.")
    }

    if(authUserId !== userId) {
        return res.status(401).json("Access Denied.");
    }

    return { user }
}