import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Photo uploads go through a Server Action (see
    // server/actions/photos.ts's uploadPhotoFile) rather than a direct
    // browser-to-R2 PUT, so the file body passes through this limit.
    // Kept under Vercel's own ~4.5MB serverless request-body ceiling.
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
