import { createRouteHandler } from "uploadthing/next";
import type { NextRequest } from "next/server";
import { env } from "@/env";

import { ourFileRouter } from "./core";

// Validate UploadThing environment variables only when route is accessed
function validateUploadThingConfig() {
  if (!env.UPLOADTHING_SECRET || !env.UPLOADTHING_APP_ID) {
    throw new Error(
      "UploadThing environment variables are not configured. Please set UPLOADTHING_SECRET and UPLOADTHING_APP_ID.",
    );
  }
}

// Export routes for Next App Router
const handler = createRouteHandler({
  router: ourFileRouter,
});

// Wrap handlers to validate config at runtime
export const GET = async (req: NextRequest) => {
  validateUploadThingConfig();
  return handler.GET(req);
};

export const POST = async (req: NextRequest) => {
  validateUploadThingConfig();
  return handler.POST(req);
};
