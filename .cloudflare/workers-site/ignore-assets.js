module.exports = {
  // Vyloučíme cache adresáře a další nepotřebné soubory
  excludeAssets: [
    '.next/cache/**',
    '.next/cache/webpack/**',
    '.next/cache/webpack/client-production/**',
    '.next/cache/webpack/client-production/0.pack',
    '.next/cache/webpack/server-production/**',
    '.next/cache/webpack/server-development/**',
    '.next/cache/webpack/client-development/**',
    'node_modules/**',
    '.git/**',
    '**/*.map',
    '**/*.ts',
    '**/*.tsx'
  ]
};
