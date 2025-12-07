const { createServer } = require("http");
const next = require("next");
const { startWorker } = require("./worker/startWorker");

const dev = false; // Always false in Render
const app = next({ dev });
const handle = app.getRequestHandler();

async function main() {
  await app.prepare();

  console.log("🚀 Starting worker...");
  startWorker();

  const server = createServer((req, res) => {
    handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🔥 Server + Worker running at http://localhost:${PORT}`);
  });
}

main();
