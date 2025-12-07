const { Worker } = require("bullmq");
const { redis } = require("../lib/redis");
const { processRepoJob } = require("./repoWorker");

function startWorker() {
  console.log("⚙️ Starting BullMQ Worker...");

  new Worker(
    "repo-processing",
    async (job) => {
      return await processRepoJob(job);
    },
    {
      connection: redis,
    }
  );
}

module.exports = { startWorker };
