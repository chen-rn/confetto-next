// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...other configurations
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*", // Allows all origins to access
          },
        ],
      },
    ];
  },
};

export default nextConfig;
