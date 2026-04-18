require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../src/models/User");

const SALT_ROUNDS = 10;

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set");

  const email = (process.env.ADMIN_EMAIL || "admin@binflow.local").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "BinFlow Admin";

  await mongoose.connect(uri);

  const existing = await User.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log("Admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    phone: "",
    ward: "",
  });

  // eslint-disable-next-line no-console
  console.log("Created admin user:", email);
  await mongoose.disconnect();
}

main().catch((e) => {
  if (e?.code === "ENOTFOUND" && e?.syscall === "querySrv") {
    // eslint-disable-next-line no-console
    console.error(
      "\n[BinFlow] MongoDB connection failed: could not resolve the database host.\n" +
        "  • Open server/.env and set MONGO_URI to your REAL connection string from MongoDB Atlas\n" +
        "    (Atlas → Connect → Drivers — hostname looks like cluster0.xxxxx.mongodb.net).\n" +
        "  • Do not keep the placeholder user:pass@cluster.mongodb.net from .env.example.\n" +
        "  • Or use local MongoDB: MONGO_URI=mongodb://127.0.0.1:27017/binflow\n"
    );
  }
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
