/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: [],
  // One host only: login cookies are per-host, so www would look logged out.
  // ponytail: "/" gets its own rule; OpenNext leaves an empty :path* unfilled.
  redirects: async () => [
    {
      source: "/",
      has: [{ type: "host", value: "www.stashr.in" }],
      destination: "https://stashr.in/",
      permanent: true,
    },
    {
      source: "/:path+",
      has: [{ type: "host", value: "www.stashr.in" }],
      destination: "https://stashr.in/:path+",
      permanent: true,
    },
  ],
};

export default config;
