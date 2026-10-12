import type { NextConfig } from "next";

/** Product photos uploaded from the admin panel live in Supabase Storage (public bucket). */
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl) : null;

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(supabaseHost
        ? [
            {
              protocol: supabaseHost.protocol.replace(":", "") as "http" | "https",
              hostname: supabaseHost.hostname,
              port: supabaseHost.port,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
