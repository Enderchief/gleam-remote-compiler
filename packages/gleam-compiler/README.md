# Gleam Compiler

The Gleam compiler in WASM, typed and built for easy use.

```sh
npm install gleam-compiler
```

```ts
import { compile, type CompilerOptions, target, mode } from "gleam-compiler";

const options = {
    target: target.JavaScript // or "javascript"
    files: {"/src/main.gleam": "pub fn main() { 42 }"},
    dependencies: [],
    mode: mode.Dev // or "Dev"
} satisfies CompilerOptions;

const { Ok, Err } = compile(options);

if (Ok) {
    console.log(Ok) 
    // {"/build/dev/javascript/gleam-wasm/gleam.mjs": "export class CustomType {\n  inspect() {\n    let field = (label) => {\n      let value = inspect(this[label]);\n...", "/build/dev/javascript/gleam-wasm/main.mjs": "export function main() {\n  return 42;\n}\n"}

}
```
