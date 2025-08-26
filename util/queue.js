import { Queue } from "bullmq";
import IORedis from 'ioredis'


const connection  = new IORedis(process.env.REDIS_URL)
export const queue = new Queue("email-queue", { connection })


const worker = new Worker("email-queue", async (job) => { }, { connection })