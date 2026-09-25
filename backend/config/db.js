const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for resolving MongoDB SRV records.
// Opt out with DNS_OVERRIDE=off if your network blocks public resolvers.
if (process.env.DNS_OVERRIDE !== 'off') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    console.warn('[Database] Could not override DNS servers, using system defaults.');
  }
}

/**
 * Automatically sanitize and format a MongoDB URI
 * (percent-encodes usernames/passwords containing special characters).
 */
function formatMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  try {
    const regex = /^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/;
    const match = rawUri.match(regex);
    if (match) {
      const [, protocol, user, pass, host, dbPath, query] = match;
      const encodedUser = encodeURIComponent(decodeURIComponent(user));
      const encodedPass = encodeURIComponent(decodeURIComponent(pass));
      const db = (dbPath && dbPath !== '/') ? dbPath : '/luxehair';
      const q = query || '?retryWrites=true&w=majority';
      return protocol + encodedUser + ':' + encodedPass + '@' + host + db + q;
    }
  } catch (e) {
    console.warn('[Database] Could not normalise MONGODB_URI, using it verbatim.');
  }
  return rawUri;
}

const MISSING_URI_MESSAGE = [
  'MONGODB_URI is not set.',
  '',
  'Local development — create backend/.env containing:',
  '  MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/luxehair?retryWrites=true&w=majority',
  '',
  'Render / production — add MONGODB_URI under Environment variables.',
  '',
  'Credentials are never hardcoded in source. Never commit backend/.env.'
].join('\n');

/**
 * Resolve the connection string from the environment.
 * Throws a descriptive error when it is absent — there is deliberately
 * no embedded fallback credential.
 */
function resolveMongoUri() {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri || !rawUri.trim()) {
    throw new Error(MISSING_URI_MESSAGE);
  }
  return formatMongoUri(rawUri.trim());
}

/**
 * Connect to MongoDB.
 * Fails fast in production (a live API with no database is worse than no API);
 * in development it warns and lets the server boot so frontend work can continue.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(resolveMongoUri(), {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);

    if (process.env.NODE_ENV === 'production') {
      console.error('[Database] Refusing to start in production without a database connection.');
      process.exit(1);
    }

    console.warn('[Database] Continuing without a database (development only). API routes that read data will fail.');
    return null;
  }
};

module.exports = connectDB;
module.exports.formatMongoUri = formatMongoUri;
module.exports.resolveMongoUri = resolveMongoUri;
