import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // For details, see: https://github.com/getsentry/sentry-javascript/blob/master/packages/nextjs/README.md
  silent: true,
  org: "cheng-1d",
  project: "javascript-nextjs",
});
