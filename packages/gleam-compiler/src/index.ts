import init, { compile as _compile } from '../compiler/gleam_wasm.js';

await init();

export const target = {
  JavaScript: 'javascript',
  Erlang: 'erlang',
} as const;

export type Target = (typeof target)[keyof typeof target];

export const mode = {
  Dev: 'Dev',
  Prod: 'Prod',
  Lsp: 'Lsp',
} as const;

export type Mode = (typeof mode)[keyof typeof mode];

export interface CompileOptions {
  /** The platform language  */
  target: Target;
  /** Mapping of a file path relative to `/` to its content */
  sourceFiles: Record<string, string>;
  /** List of dependencies.
   * *Note*: These are **not** fetched from hex, the dependency files need to be supplied in sourceFiles.
   */
  dependencies: string[];
  /**
   * Output mode
   */
  mode: Mode;
}

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
export function compile(
  options: CompileOptions
):
  | { Ok: Map<string, string>; Err?: undefined }
  | { Ok: undefined; Err: string } {
  return _compile(options);
}
