import jsxAccessibility from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['storybook-static/**', 'coverage/**']),
  ...typescriptEslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  jsxAccessibility.flatConfigs.recommended,
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
]);
