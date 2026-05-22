// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: ['dist', '.expo', 'node_modules', 'web-build'],
  rules: {
    'import/namespace': 'off',
    'import/export': 'off',
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/default': 'off'
  },
  overrides: [
    {
      files: ['*.config.js', '.eslintrc.js', 'babel.config.js'],
      env: {
        node: true
      }
    }
  ]
};
