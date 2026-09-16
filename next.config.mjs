/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable WebAssembly
  webpack: (config, { isServer }) => {
    // Required for .wasm file support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Serve .wasm files from public directory correctly
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },

  // Required for the Emscripten WASM module
  async headers() {
    return [
      {
        source: '/calculator.wasm',
        headers: [
          { key: 'Content-Type', value: 'application/wasm' },
        ],
      },
    ];
  },

  // Output for static hosting
  output: 'standalone',

  // Strict mode
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
