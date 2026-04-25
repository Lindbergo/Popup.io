import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle the knowledge markdown files into the serverless function.
  // Vercel can't statically trace fs.readFileSync with dynamic paths.
  outputFileTracingIncludes: {
    "/api/generate": ["./knowledge/**/*"],
  },
};

export default nextConfig;
