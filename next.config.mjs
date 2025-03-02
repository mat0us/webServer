import withPWA from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimalizujeme JavaScript pro lepší výkon
  swcMinify: true,
  // Vypneme generování sourcemaps v produkci pro menší velikost buildu
  productionBrowserSourceMaps: false,
  // Optimalizujeme velikost balíčku
  compiler: {
    // Odstraníme všechny console.log v produkčním buildu
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },
  // Optimalizujeme obrázky
  images: {
    unoptimized: false,
  },
  // Nastavíme output na 'export' místo 'standalone' pro lepší kompatibilitu s Cloudflare Pages
  output: 'export',
  // Přidáme webpack konfiguraci pro lepší optimalizaci
  webpack: (config, { dev, isServer }) => {
    // Optimalizace pro produkční build
    if (!dev) {
      // Splitování chunků pro lepší výkon a menší soubory
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 20000000, // Nastavení maximální velikosti chunků
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            // Tyto balíčky jsou společné a měly by být v jednom chunku
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            minChunks: 2,
            name(module) {
              // Získáme jméno balíčku z node_modules
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!match) return 'npm.unknown';
              
              // Vrátíme jméno npm balíčku
              const packageName = match[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      };
    }

    return config;
  },
};

// Aplikujeme PWA konfiguraci
const nextConfigWithPWA = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [],
})(nextConfig);

// Aplikujeme bundle analyzer
export default withBundleAnalyzerConfig(nextConfigWithPWA);
