module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true, // For client-side code
    node: true, // For server-side code
    es2021: true,
  },
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed with modern React
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
