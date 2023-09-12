import { compile } from "./compiler.ts";
import { Client } from "./hex.ts";

function json(obj: object = {}, init?: ResponseInit) {
  return new Response(
    JSON.stringify(obj),
    Object.assign(
      {
        headers: { "content-type": "application/json" },
      },
      init,
    ),
  );
}

const client = new Client();

export interface CompileRequest {
  files: Record<string, string>;
  dependencies: Record<string, string>;
}

Deno.serve(async (req) => {
  const body = (await req.json()) as Record<string, string>;
  let request: CompileRequest;

  if (
    typeof body === "object" &&
    typeof body.dependencies === "object" &&
    typeof body.files === "object"
  ) {
    request = body as unknown as CompileRequest;
  } else {
    return json({ error: "malformed body", type: "external" });
  }

  const files = {};

  try {
    for (const name in request.dependencies) {
      if (Object.prototype.hasOwnProperty.call(request.dependencies, name)) {
        const version = request.dependencies[name];
        try {
          const pkg = await client.fetch_files(name, version);
          if (typeof pkg !== "object") {
            return json({
              error: `${pkg === "404" ? "package or version not found" : pkg}`,
              type: "external",
            });
          }
          Object.assign(files, pkg);
          console.log("got package", name);
        } catch (e) {
          return json({ error: e.toString(), type: "external" });
        }
      }
    }
  } catch (e) {
    return json({ error: e.toString(), type: "external" });
  }

  const { Ok, Err } = compile({
    dependencies: Object.keys(request.dependencies),
    mode: "Dev",
    sourceFiles: {
      "/gleam.toml": '[dependencies]\ngleam_stdlib = "0.30.2"',
      ...files,
      ...request.files,
    },

    target: "javascript",
  });

  if (Err) return json({ error: Err, type: "gleam", files, body: body });

  const entries = Array.from(Ok!.entries()).map(([k, v]) => [
    k.replace(/\/build\/packages\/(.+)\/src/, "/build/dev/javascript/$1"),
    v,
  ]);

  return json({ ok: Object.fromEntries(entries) });
});
