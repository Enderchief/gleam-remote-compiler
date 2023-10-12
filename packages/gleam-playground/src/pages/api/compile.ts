import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import init, { compile } from '../../compiler/gleam_wasm.js';

await init();

export const bodySchema = z.object({
  files: z.record(z.string(), z.string()),
  dependencies: z.record(z.string(), z.string()).optional(),
  target: z
    .union([z.literal('javascript'), z.literal('erlang')])
    .default('javascript'),
});

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('Content-Type');
  if (contentType !== 'application/json')
    return json({
      error: `invalid content type "${contentType}", expecting "application/json"`,
    });

  try {
    const rawData = await request.json();
    const data = bodySchema.safeParse(rawData);
    if (!data.success) return json({ error: data.error.toString() });

    const { Ok, Err } = compile({
      dependencies: [],
      mode: 'Dev',
      sourceFiles: data.data.files,
      target: data.data.target,
    });

    if (Err) return json({ error: Err });
    return json({ Ok: Object.fromEntries(Ok!.entries()) });
  } catch (e) {
    return json({
      error: `malformed json`,
    });
  }
};

function json(o: any, init?: ResponseInit) {
  return new Response(JSON.stringify(o), {
    headers: { 'content-type': 'application/json' },
    status: init?.status!,
  });
}
