import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = createApp(config);

const server = app.listen(config.port, () => {
  console.log(`Listening on http://localhost:${config.port}`);
});

function shutDown(signal: NodeJS.Signals): void {
  console.log(`${signal} received; stopping the server`);

  server.close((error) => {
    if (error) {
      console.error("The server could not stop cleanly", error);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", shutDown);
process.once("SIGTERM", shutDown);
