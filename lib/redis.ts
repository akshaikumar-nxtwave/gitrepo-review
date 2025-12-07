import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const redis = new Redis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: null, 
  enableReadyCheck: false,    
  tls: {},                    
});
