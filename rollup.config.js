import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import typescript from "rollup-plugin-typescript2";

export default {
  input: ["./client/index.tsx"],

  external: ["react", "react-dom", "phaser"],

  output: {
    file: "./public/dist/bundle.js",
    name: "App",
    format: "iife",
    sourcemap: true,
    globals: {
      react: "React",
      "react-dom": "ReactDOM",
      phaser: "Phaser",
    },
    intro: "var global = window;",
  },

  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("development"),

      //  Enable / disable Phaser 3 features:
      "typeof CANVAS_RENDERER": JSON.stringify(true),
      "typeof WEBGL_RENDERER": JSON.stringify(true),
      "typeof EXPERIMENTAL": JSON.stringify(true),
      "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
      "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
      "typeof FEATURE_SOUND": JSON.stringify(true),
    }),

    resolve({
      browser: true,
      exclude: [""],
    }),

    commonjs({
      include: ["node_modules/**"],
      exclude: [
        "node_modules/phaser/src/polyfills/requestAnimationFrame.js",
        "node_modules/symbol-observable/es/*.js",
      ],
      sourceMap: true,
      ignoreGlobal: true,
    }),

    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
    }),

    typescript(),
  ],
};
