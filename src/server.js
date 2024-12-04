import app from "./gateway/index.js";
import "dotenv/config";

const start = async () => {
  const port = process.env.GATEWAY_PORT || 5002;
  app
    .listen(port, () => console.log(`Server running on port ${port}\n`))
    .on("error", (error) => {
      console.error("Server running error");
      console.error(error.message);
      process.exit(2);
    });
};

export default {
  start,
};
