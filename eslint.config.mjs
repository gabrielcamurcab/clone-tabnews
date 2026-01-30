import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import jestPlugin from "eslint-plugin-jest";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  // Spread Next.js recommended config
  ...nextVitals,

  // Add Jest plugin configuration
  {
    files: ["**/*.test.js", "**/*.test.jsx", "**/*.test.ts", "**/*.test.tsx"],
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
  },

  // Prettier config (desabilita regras conflitantes)
  prettier,

  // Global ignores
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
]);

export default eslintConfig;
