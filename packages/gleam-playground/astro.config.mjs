import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel/serverless"
import solid from "@astrojs/solid-js";
import UnoCSS from "unocss/astro";
import inspect from "vite-plugin-inspect"
import wasm from "vite-plugin-wasm";

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel(),
    integrations: [solid(), UnoCSS({ injectReset: true })],
    vite: {
        plugins: [inspect(), wasm()],
        build: {
            sourcemap: true,
        },
        worker: {
            format: 'es',
            plugins: [
                wasm()
            ]
        },
        optimizeDeps: { exclude: ["./src/compiler"] }
    },

});
