// Webpack loader: marks `import("https://...")` calls as runtime imports.
//
// @shopify/hydrogen loads Shopify's standard-events module straight from
// Shopify's CDN with a dynamic import of a URL. Webpack tries to bundle that
// URL at build time and fails ("UnhandledSchemeError"). `webpackIgnore: true`
// tells webpack to leave the import alone so the browser fetches it at runtime,
// which is what Shopify intends.
module.exports = function webpackIgnoreUrlImports(source) {
  return source.replace(
    /import\(\s*(["'])(https:\/\/[^"']+)\1\s*\)/g,
    "import(/* webpackIgnore: true */ $1$2$1)"
  );
};
