import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const emailWorker = new Worker(
  "queueflow-jobs",
  async (job) => {
    console.log("Processing job:", job.id);
    console.log("Job name:", job.name);
    console.log("Job data:", job.data);

    // Temporary simulation of email processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Job processed successfully:", job.id);

    return { success: true };
  },
  { connection },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("QueueFlow email worker is running...");
