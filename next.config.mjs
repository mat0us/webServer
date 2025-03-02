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
    unoptimized: true, // Nastavíme na true pro statický export
  },
  // Explicitně nastavíme output na 'export' pro statický export
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
        maxSize: 1000000, // Snížíme maximální velikost chunků na 1MB
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            // Tyto balíčky jsou společné a měly by být v jednom chunku
            enforce: true,
          },
          commons: {
            name: 'commons',
            test: /[\\/]node_modules[\\/](next|firebase|recharts)[\\/]/,
            priority: 30,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };

      // Minimalizace pro produkci
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions.compress,
                drop_console: true,
              },
              keep_classnames: true,
              keep_fnames: true,
            };
          }
        });
      }
    }

    return config;
  },
  // Vyloučíme cache adresáře z buildu
  distDir: '.next',
  cleanDistDir: true,
  experimental: {
    // Vypneme generování sourcemaps pro server
    serverSourceMaps: false,
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
