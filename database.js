import { connect } from 'mongoose'



async function ConnectDB() {
    try {
        const res = await connect(process.env.MONGODB_URL)
        console.log("DB RESP", res)
        // if(res.includes("Invalid")) throw new Error(res)
    } catch(err) {
        console.log(err.message)
    }
}

export default ConnectDB