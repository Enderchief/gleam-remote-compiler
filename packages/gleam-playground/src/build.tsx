import wasmURL from 'esbuild-wasm/esbuild.wasm?url';
import { build, initialize, type Plugin } from 'esbuild-wasm';
import type { Setter, JSXElement, Accessor } from 'solid-js';
import type { createFilesystem } from './components/Editor';
import { parse } from 'smol-toml';

await initialize({ wasmURL });

export type CompileResult =
  | { Ok: Map<string, string>; error: undefined }
  | { Ok: undefined; error: string };

export async function compileCode(
  file: ReturnType<typeof createFilesystem>,
  compiler: Worker,
  setOutput: Setter<JSXElement>
): Promise<void> {
  const body = file.contents();

  const rawToml = body['gleam.toml'] || '';
  const parsedToml = parse(rawToml);
  const dependencies = parsedToml.dependencies;

  const res = await fetch('/api/hex', {
    body: JSON.stringify(dependencies),
    headers: { 'content-type': 'application/json' },
    method: 'post',
  });

  if (!res.ok) return void setOutput(<pre class='c-red-5'>{res.status}</pre>);

  const deps = await res.json();

  Object.assign(body, deps);

  compiler.postMessage({ files: body, dependencies });
}

export function virtual(files: CompileResult) {
  return {
    name: 'playground-virtual-filesystem',
    setup(build) {
      const res = files?.Ok!;
      build.onResolve({ filter: /ENTRY/ }, (_) => {
        return { path: 'ENTRY', namespace: 'gleam' };
      });
      build.onLoad({ filter: /ENTRY/, namespace: 'gleam' }, (_) => {
        return {
          contents:
            'import {main} from "/build/dev/javascript/gleam-wasm/main.mjs";(console.log(main)||main)',
        };
      });

      build.onResolve({ filter: /\.mjs$/ }, async (args) => {
        if (args.path.startsWith('/'))
          return { path: args.path, namespace: 'gleam' };

        const url = new URL(`file:${args.importer}/../${args.path}`);

        return { path: url.pathname, namespace: 'gleam' };
      });
      build.onLoad({ namespace: 'gleam', filter: /\.*/ }, (args) => {
        const o = res.get(args.path)!;

        return { contents: o };
      });
    },
  } satisfies Plugin;
}

export async function bundle(
  result: CompileResult,
  setOutput: Setter<JSXElement>,
  output: Accessor<JSXElement>
) {
  const res = await build({
    entryPoints: ['ENTRY'],
    plugins: [virtual(result)],
    bundle: true,
    format: 'esm',
  });
  const td = new TextDecoder('utf-8');
  const content = td.decode(res.outputFiles![0]!.contents);

  const eval_res = eval(content + '\nmain');
  if (!eval_res) return;
  const _log = console.log,
    _error = console.error;

  console.log = (...args) => {
    setOutput([output(), <pre>{args}</pre>]);
    _log(...args);
  };
  console.error = (...args) => {
    setOutput([output(), <pre class='c-red-5'>{args}</pre>]);
    _error(...args);
  };
  setOutput();
  eval_res();

  console.log = _log;
  console.error = _error;
}
