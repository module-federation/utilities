import resolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".ts", ".tsx", ".json"];

const config = {
  input: "src/index.ts",
  external: [/@babel\/runtime/, "react", "react-dom"],
  output: [
    {
      dir: "dist/",
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
