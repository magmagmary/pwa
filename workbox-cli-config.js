module.exports = {
  globDirectory: ".",
  globPatterns: ["**/*.{png,jpg,js,css,html}"],
  swDest: "service-worker.js",
  globIgnores: [
    "workbox-cli-config.js",
    "node_modules/**/*",
    "functions/**/*",
    "public/**/*",
  ],
};
