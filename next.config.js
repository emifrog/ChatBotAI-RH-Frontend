/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  webpack: (config) => {
    // S'assurer que splitChunks et cacheGroups existent
    if (!config.optimization) {
      config.optimization = {};
    }
    if (!config.optimization.splitChunks) {
      config.optimization.splitChunks = {};
    }
    if (!config.optimization.splitChunks.cacheGroups) {
      config.optimization.splitChunks.cacheGroups = {};
    }
    
    // Ajouter le cache group pour le chatbot
    config.optimization.splitChunks.cacheGroups.chatbot = {
      name: 'chatbot',
      test: /[\/]src[\/]components[\/](ChatBot|hr|mobile|ui)[\/]/,
      chunks: 'all',
      enforce: true,
    };
    
    return config;
  },
};

module.exports = nextConfig;