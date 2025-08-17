import { connect } from 'mongoose'
import "dotenv/config.js"


async function ConnectDB() {
    try {
        await connect(process.env.MONGODB_URL)
    } catch(err) {
        console.log(err.message)
    }
}

export default ConnectDB