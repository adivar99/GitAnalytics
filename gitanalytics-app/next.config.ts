import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // webpackDevMiddleware: config => {
  //   config.watchOptions = {
  //     poll: 1000, // Poll every second for changes
  //     aggregateTimeout: 300,
  //   }
  //   return config
  // },
};

export default nextConfig;
