import { getCloudflareContext } from "@opennextjs/cloudflare";
import mongoose from "mongoose";
import { env } from "@/env";

const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * ponytail: one connection per request. Workers can't touch a socket opened
 * by another request, so the old isolate-global connection hung every request
 * after the first. Costs a TLS+auth handshake per request; a Durable Object
 * holding the client is the upgrade if that latency matters.
 */
const connections = new WeakMap<object, Promise<mongoose.Connection>>();
const nodeKey = {}; // `next dev` / build: no Workers context, one shared connection is fine

function requestKey(): object {
  try {
    return getCloudflareContext().ctx;
  } catch {
    return nodeKey;
  }
}

function connectDB(): Promise<mongoose.Connection> {
  const key = requestKey();
  let conn = connections.get(key);
  if (!conn) {
    const c = mongoose.createConnection(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      // Models are recompiled per connection; don't re-run index/collection setup each request.
      autoIndex: false,
      autoCreate: false,
    });
    // mongoose.connections holds every connection forever; drop it so it dies with the request.
    mongoose.connections.splice(mongoose.connections.indexOf(c), 1);
    conn = c.asPromise();
    connections.set(key, conn);
  }
  return conn;
}

export default connectDB;
