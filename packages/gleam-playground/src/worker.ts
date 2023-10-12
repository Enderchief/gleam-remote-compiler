import init, { compile } from './compiler/gleam_wasm.js';
import { bodySchema } from './pages/api/compile.js';

await init();

onmessage = (ev) => {
  if (!ev.data) return postMessage({ error: 'no data supplied' });
  const body = bodySchema.safeParse(ev.data);
  if (!body.success) return postMessage({ error: body.error.toString() });

  const { Ok, Err } = compile({
    dependencies: Object.keys(body.data.dependencies || {}),
    mode: 'Dev',
    sourceFiles: body.data.files,
    target: body.data.target,
  });

  if (Err) return postMessage({ error: Err });

  return postMessage({ Ok });
};
