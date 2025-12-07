import { Queue } from "bullmq";
import { redis } from "./redis";

export const repoQueue = new Queue("repo-processing", {
  connection: redis,
});
