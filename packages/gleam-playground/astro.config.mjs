import { defineConfig } from 'astro/config';
import deno from "@astrojs/deno"
import solid from "@astrojs/solid-js";
import UnoCSS from "unocss/astro";
import inspect from "vite-plugin-inspect"
import wasm from "vite-plugin-wasm";

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: deno(),
    integrations: [solid(), UnoCSS({ injectReset: true })],
    vite: {
        plugins: [inspect(), wasm()],
        build: {
            sourcemap: true
        },
        optimizeDeps: { exclude: ["./src/compiler"] }
    },
});
