const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (error.message?.includes("querySrv") || error.code === "ECONNREFUSED") {
      console.error(
        "\nFix (Windows): Node cannot resolve mongodb+srv DNS. Run:\n" +
          "  npm run mongo:fix-uri\n" +
          "Then restart the server. Or use a standard mongodb:// URI from Atlas Connect.\n"
      );
    }
    process.exit(1);
  }
}

module.exports = connectDB;