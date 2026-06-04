import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
    { ignores: ["node_modules", "dist", "coverage", "web"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: { process: "readonly", console: "readonly" },
        },
        rules: {
            // permite parâmetros/variáveis intencionalmente não usados com prefixo "_"
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
        },
    },
    // desativa regras de estilo que conflitam com o Prettier
    prettier,
);
