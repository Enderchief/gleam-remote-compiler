import { defineConfig } from 'astro/config';
import deno from "@astrojs/deno"
import solid from "@astrojs/solid-js";
import UnoCSS from "unocss/astro";
import inspect from "vite-plugin-inspect"

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: deno(),
    integrations: [solid(), UnoCSS({ injectReset: true })],
    vite: {
        plugins: [inspect()],
        build: {
            sourcemap: true
        }
    },
});
