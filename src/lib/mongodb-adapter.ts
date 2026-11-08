import type { MongoClient } from "mongodb";
import connectDB from "@/lib/mongodb";

/**
 * The MongoClient used by next-auth's adapter.
 *
 * ponytail: this reuses mongoose's own client rather than opening a second
 * one. Two clients meant two TLS+SCRAM handshakes per request on Workers,
 * which cannot reuse a socket across requests.
 *
 * Lazy on purpose — Workers disallows I/O in module scope, so the connection
 * must not start until a request is actually being handled.
 */
export async function getMongoClient(): Promise<MongoClient> {
  const conn = await connectDB();
  return conn.getClient() as unknown as MongoClient;
}

export default getMongoClient;
