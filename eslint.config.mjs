import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // public/ holds the preserved RideRadar static build — minified vendor
    // bundles shipped verbatim, which are not ours to fix.
    "public/**",
  ]),

  {
    // Registry components are vendored: `shadcn add` overwrites them, so
    // fixing upstream's react-compiler violations here would be undone on the
    // next update. Downgraded to warnings so a genuine violation in our own
    // code is not buried under someone else's.
    files: [
      "components/animate-ui/**",
      "hooks/use-auto-height.tsx",
      "hooks/use-is-in-view.tsx",
      "hooks/use-motion-value-state.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/component-hook-factories": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/static-components": "warn",
    },
  },
]);

export default eslintConfig;
