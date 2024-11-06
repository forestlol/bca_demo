module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods',  // or @babel/plugin-transform-private-methods
  ],
};
