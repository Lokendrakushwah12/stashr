import { createRouteHandler } from "uploadthing/next";
import { env } from "@/env";

import { ourFileRouter } from "./core";

// Validate UploadThing environment variables at runtime
if (!env.UPLOADTHING_SECRET || !env.UPLOADTHING_APP_ID) {
  throw new Error(
    "UploadThing environment variables are not configured. Please set UPLOADTHING_SECRET and UPLOADTHING_APP_ID.",
  );
}

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
