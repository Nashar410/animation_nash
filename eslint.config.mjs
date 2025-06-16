// eslint.config.mjs - Version optimisée avec gestion des warnings
import { defineConfig } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    {
        ignores: [
            "dist/**",
            "build/**",
            "node_modules/**",
            "coverage/**",
            "*.config.js",
            "*.config.ts"
        ]
    },
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        extends: fixupConfigRules(compat.extends(
            "eslint:recommended",
            "plugin:react/recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:react-hooks/recommended",
        )),

        plugins: {
            react: fixupPluginRules(react),
            "@typescript-eslint": fixupPluginRules(typescriptEslint),
            "react-hooks": fixupPluginRules(reactHooks),
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest,
                ...globals.node,
            },
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: { jsx: true },
                project: "./tsconfig.json",
            },
        },

        settings: {
            react: { version: "detect" },
        },

        rules: {
            // React rules
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/display-name": "warn",

            // TypeScript rules
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "warn", // Warn au lieu d'error
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],
            "@typescript-eslint/no-non-null-assertion": "warn", // Warn au lieu d'error

            // React Hooks rules - plus flexible
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // Console rules - autorisé en développement
            "no-console": ["warn", {
                "allow": ["warn", "error", "debug", "info"]
            }],

            // General rules
            "prefer-const": "error",
            "no-var": "error",
        },
    },

    // Règles relaxées pour les tests
    {
        files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "no-console": "off",
        }
    },

    // Règles relaxées pour les utilitaires
    {
        files: ["shared/utils/**", "core/**/utils/**"],
        rules: {
            "no-console": "off", // Logger utilise console
        }
    },

    // Règles pour les fichiers de déclaration
    {
        files: ["**/*.d.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
        }
    },
    {
        files: ["core/model-loader/**"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off", // APIs Three.js utilisent any
        }
    },
]);