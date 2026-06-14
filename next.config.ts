import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Notion 이미지 및 외부 이미지 도메인 허용
  images: {
    remotePatterns: [
      {
        // Notion 업로드 이미지 (S3)
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        // Notion 공개 첨부 파일
        protocol: "https",
        hostname: "*.notion.so",
      },
      {
        // Notion 이미지 프록시
        protocol: "https",
        hostname: "www.notion.so",
      },
    ],
  },
};

export default nextConfig;
