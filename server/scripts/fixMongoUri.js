/**
 * Converts mongodb+srv:// to mongodb:// using Windows nslookup (Node dns.resolveSrv often fails on Windows).
 * Run: npm run mongo:fix-uri
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const envPath = path.resolve(__dirname, "../.env");
if (!fs.existsSync(envPath)) {
  console.error("No server/.env file found. Copy .env.example to .env first.");
  process.exit(1);
}

const envText = fs.readFileSync(envPath, "utf8");
const lineMatch = envText.match(/^MONGO_URI=(.+)$/m);
if (!lineMatch) {
  console.error("MONGO_URI not found in .env");
  process.exit(1);
}

const uri = lineMatch[1].trim().replace(/^["']|["']$/g, "");
if (!uri.startsWith("mongodb+srv://")) {
  console.log("MONGO_URI is already a standard mongodb:// URI (or empty). Nothing to do.");
  process.exit(0);
}

const parsed = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
if (!parsed) {
  console.error("Could not parse MONGO_URI. Check format in .env");
  process.exit(1);
}

const creds = parsed[1];
const clusterHost = parsed[2];
const dbPath = parsed[3] || "/binflow";
const query = parsed[4] || "";

let txtParams = "authSource=admin";
try {
  const txtOut = execSync(`nslookup -type=TXT ${clusterHost}`, { encoding: "utf8" });
  const txtMatch = txtOut.match(/"([^"]+)"/);
  if (txtMatch) txtParams = txtMatch[1];
} catch {
  console.warn("TXT lookup failed; using authSource=admin only.");
}

const replicaSet = txtParams.match(/replicaSet=([^&]+)/)?.[1];
if (!replicaSet) {
  console.error("Could not read replicaSet from Atlas TXT record. Get a standard URI from Atlas Connect UI instead.");
  process.exit(1);
}

let srvOut;
try {
  srvOut = execSync(`nslookup -type=SRV _mongodb._tcp.${clusterHost}`, { encoding: "utf8" });
} catch (err) {
  console.error("SRV nslookup failed:", err.message);
  process.exit(1);
}

const hosts = [...srvOut.matchAll(/svr hostname\s*=\s*(\S+)/gi)].map((m) => m[1]);
if (hosts.length === 0) {
  console.error("No shard hosts found in nslookup output.");
  process.exit(1);
}

const hostList = hosts.map((h) => `${h}:27017`).join(",");
const baseQuery = new URLSearchParams(txtParams);
baseQuery.set("ssl", "true");
baseQuery.set("retryWrites", "true");
baseQuery.set("w", "majority");

const extra = query.startsWith("?") ? query.slice(1) : query;
if (extra) {
  for (const part of extra.split("&")) {
    const [k, v] = part.split("=");
        if (k) baseQuery.set(k, v || "");
  }
}

const newUri = `mongodb://${creds}@${hostList}${dbPath}?${baseQuery.toString()}`;
const newEnv = envText.replace(/^MONGO_URI=.*$/m, `MONGO_URI=${newUri}`);
fs.writeFileSync(envPath, newEnv, "utf8");

console.log("Updated MONGO_URI to standard mongodb:// (no SRV DNS required).");
console.log(`Shard hosts: ${hosts.length}`);
console.log(`Replica set: ${replicaSet}`);
console.log("Restart the server: npm run dev");
