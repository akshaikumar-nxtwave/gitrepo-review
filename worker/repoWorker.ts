import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Worker } from "bullmq";
import { redis } from "../lib/redis";
import os from "os";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { supabase } from "../lib/supabase";
import { chunkText } from "../lib/chunkText";

console.log("Repo Worker Started...");
console.log("ENV URL:", process.env.UPSTASH_REDIS_URL);

const worker = new Worker(
  "repo-processing",
  async (job) => {
    const { sessionId, repoId, git_url } = job.data;

    console.log("Processing repo:", repoId, git_url);

    // ---------- FIXED: CROSS-PLATFORM TEMP DIRECTORY ----------
    const repoPath = path.join(os.tmpdir(), "code-review", repoId);

    // Remove folder if it exists (Windows fix)
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }

    fs.mkdirSync(repoPath, { recursive: true });

    // ---------- STEP 3: CLONE REPO ----------
    const git = simpleGit();

    try {
      await git.clone(git_url, repoPath);
      console.log("Repo cloned at:", repoPath);

      await supabase
        .from("repos")
        .update({ status: "indexing" })
        .eq("id", repoId);
    } catch (err) {
      console.error("Clone error:", err);
      await supabase.from("repos").update({ status: "failed" }).eq("id", repoId);
      throw err;
    }

    // ---------- FIXED: DETECT NESTED FOLDER ----------
    const repoFolder = git_url.split("/").pop()?.replace(".git", "") || "";
    const nestedPath = path.join(repoPath, repoFolder);

    const targetPath = fs.existsSync(nestedPath) ? nestedPath : repoPath;

    console.log("Scanning files in:", targetPath);

    // ---------- STEP 4: WALK ALL FILES ----------
    const allFiles: string[] = [];

    function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (["node_modules", ".git", "dist", "build", "out"].includes(entry.name)) continue;
          walk(fullPath);
        } else {
          allFiles.push(fullPath);
        }
      }
    }

    walk(targetPath);

    console.log(`Found ${allFiles.length} files in repo`);

    // ---------- STEP 4: CHUNK + SAVE ----------
    for (const file of allFiles) {
      let content = "";

      try {
        content = fs.readFileSync(file, "utf-8");
      } catch {
        console.log("Skipping unreadable file:", file);
        continue;
      }

      const chunks = chunkText(content);

      const cleanPath = file
        .replace(targetPath + path.sep, "")
        .replace(/\\/g, "/");

      for (let i = 0; i < chunks.length; i++) {
        await supabase.from("code_chunks").insert({
          repo_id: repoId,
          file_path: cleanPath,
          chunk_index: i,
          content: chunks[i],
        });
      }
    }

    // STEP COMPLETE
    await supabase
      .from("repos")
      .update({ status: "indexed" })
      .eq("id", repoId);

    console.log(`Repo indexing complete: ${repoId}`);

    return { repoId, files: allFiles.length };
  },
  {
    connection: redis,
  }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job?.id}`, err);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});
