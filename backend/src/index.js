import { config } from "./config.js";
import { connectDb, disconnectDb } from "./db.js";
import { createApp } from "./app.js";
import { seedAll } from "./seed.js";

await connectDb();
await seedAll();

const server = createApp().listen(config.port, () => {
  console.log(`[server] MindMate API listening on http://localhost:${config.port}`);
});

async function shutdown() {
  server.close();
  await disconnectDb();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
