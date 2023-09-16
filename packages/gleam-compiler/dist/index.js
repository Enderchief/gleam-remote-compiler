import init, { compile as _compile } from '../compiler/gleam_wasm.js';
await init();
export const target = {
    JavaScript: 'javascript',
    Erlang: 'erlang',
};
export const mode = {
    Dev: 'Dev',
    Prod: 'Prod',
    Lsp: 'Lsp',
};
/**
 * Typed compile function for Gleam.
 *
 * ```ts
 * const options = {
 *  target: Target.JavaScript,
 *  sourceFiles: {
 *      "/src/main.ts": "pub fn main() { 42 }"
 *  },
 *  dependencies: [],
 *  mode: Mode.Dev
 * }
 *
 * const { Ok, Err } = compile(options);
 * ```
 */
export function compile(options) {
    return _compile(options);
}
