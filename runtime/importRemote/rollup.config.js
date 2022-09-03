import resolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".ts", ".tsx", ".json"];

const config = {
  input: "src/index.ts",
  output: [
    {
      dir: "dist/esm",
      format: "esm",
      preserveModules: true,
      sourcemap: true,
    },
    {
      dir: "dist/cjs",
      format: "cjs",
      preserveModules: true,
      exports: "auto",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    babel({
      include: "src/**/*",
      exclude: "**/node_modules/**",
      babelHelpers: "runtime",
      extensions,
    }),
    terser(),
  ],
};

export default config;
