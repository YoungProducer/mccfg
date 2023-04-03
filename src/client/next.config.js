/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '../../.next',
  eslint: {
    dirs: ['src/client'], // https://github.com/thisismydesign/nestjs-starter/issues/82
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
};

module.exports = nextConfig;
