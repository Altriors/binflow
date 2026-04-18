const path = require("path");

// Load server/.env regardless of current working directory (same as scripts/seedAdmin.js)
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = require("./app");
const { connectDB } = require("./config/db");

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectDB();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`BinFlow API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
