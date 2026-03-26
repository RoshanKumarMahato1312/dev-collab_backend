import http from "http";
import { app } from "./src/app";
import { connectDb } from "./src/config/db";
import { env } from "./src/config/env";
import { setupSocket } from "./src/config/socket";

const startServer = async (): Promise<void> => {
  await connectDb(env.mongoUri);

  const server = http.createServer(app);
  setupSocket(server);

  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
