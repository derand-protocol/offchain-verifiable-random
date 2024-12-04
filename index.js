import "dotenv/config";
import db from "./src/db/index.js";
import server from "./src/server.js";

const main = async () => {
  await db.init();
  await db.seed();
  server.start();
};

main();
