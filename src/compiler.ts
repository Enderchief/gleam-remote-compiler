import init, { compile as _compile } from "../compiler/gleam_wasm.js";
import "https://deno.land/std@0.201.0/dotenv/load.ts";

await init();

export const target = {
  JavaScript: "javascript",
  Erlang: "erlang",
} as const;

export type Target = (typeof target)[keyof typeof target];

export const mode = {
  Dev: "Dev",
  Prod: "Prod",
  Lsp: "Lsp",
} as const;

export type Mode = (typeof mode)[keyof typeof mode];

export interface CompileOptions {
  target: Target;
  sourceFiles: Record<string, string>;
  dependencies: string[];
  mode: Mode;
}

export function compile(
  options: CompileOptions,
):
  | { Ok: Map<string, string>; Err?: undefined }
  | { Ok: undefined; Err: string } {
  return _compile(options);
}
