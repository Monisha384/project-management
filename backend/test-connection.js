const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log("=== MongoDB Connection Test ===\n");
console.log("Testing connection to MongoDB Atlas...\n");

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is not set in .env file");
  process.exit(1);
}

// Hide password in logs
const safeUri = MONGO_URI.replace(/:([^@]+)@/, ':****@');
console.log("Connection String (password hidden):", safeUri);
console.log("");

async function testConnection() {
  try {
    console.log("⏳ Attempting to connect...");
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ SUCCESS! Connected to MongoDB Atlas");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    
    await mongoose.connection.close();
    console.log("\n✅ Connection test completed successfully");
    process.exit(0);
    
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED");
    console.error("\nError Type:", error.name);
    console.error("Error Message:", error.message);
    
    console.log("\n=== Troubleshooting Steps ===");
    
    if (error.message.includes("IP") || error.message.includes("whitelist")) {
      console.log("1. Go to MongoDB Atlas → Network Access");
      console.log("2. Click 'Add IP Address'");
      console.log("3. Add 0.0.0.0/0 (Allow access from anywhere)");
      console.log("4. Wait 2-3 minutes for changes to apply");
    } else if (error.message.includes("authentication")) {
      console.log("1. Go to MongoDB Atlas → Database Access");
      console.log("2. Verify username: Monisha");
      console.log("3. Reset password if needed");
      console.log("4. Update MONGO_URI in .env file");
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.log("1. Check your internet connection");
      console.log("2. Verify cluster URL is correct");
      console.log("3. Try disabling VPN if active");
    } else {
      console.log("1. Verify your cluster is active (not paused)");
      console.log("2. Get a fresh connection string from Atlas");
      console.log("3. Check MongoDB Atlas status page");
    }
    
    process.exit(1);
  }
}

testConnection();
