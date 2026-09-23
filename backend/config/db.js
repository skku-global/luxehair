const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for resolving MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

/**
 * Automatically sanitize and format MongoDB URI (encodes passwords with special characters)
 */
function formatMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  try {
    const regex = /^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/;
    const match = rawUri.match(regex);
    if (match) {
      const [_, protocol, user, pass, host, dbPath, query] = match;
      const encodedUser = encodeURIComponent(decodeURIComponent(user));
      const encodedPass = encodeURIComponent(decodeURIComponent(pass));
      const db = (dbPath && dbPath !== '/') ? dbPath : '/luxehair';
      const q = query || '?retryWrites=true&w=majority';
      return protocol + encodedUser + ':' + encodedPass + '@' + host + db + q;
    }
  } catch (e) {}
  return rawUri;
}

const ATLAS_FALLBACK_URI = 'mongodb+srv://drake77e777_db_user:xR3BsMLDTqk0OKEb@luxhair.xhbrqsa.mongodb.net/luxehair?retryWrites=true&w=majority';

/**
 * Connect to MongoDB database
 * Uses process.env.MONGODB_URI, falling back directly to MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const rawURI = process.env.MONGODB_URI || ATLAS_FALLBACK_URI;
    const connURI = formatMongoUri(rawURI);

    if (process.env.RENDER && !process.env.MONGODB_URI) {
      console.log('ℹ️ [Render Notice] Using configured MongoDB Atlas cluster.');
    }

    const conn = await mongoose.connect(connURI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    if (process.env.RENDER || !process.env.MONGODB_URI) {
      console.warn('💡 Tip: On Render, add MONGODB_URI in Environment variables: mongodb+srv://<user>:<password>@cluster.mongodb.net/luxehair?retryWrites=true&w=majority');
    }
    console.log('[Database Warning] Continuing with server startup. If Mongo is not running, ensure service is started.');
  }
};

module.exports = connectDB;
module.exports.formatMongoUri = formatMongoUri;
module.exports.ATLAS_FALLBACK_URI = ATLAS_FALLBACK_URI;
