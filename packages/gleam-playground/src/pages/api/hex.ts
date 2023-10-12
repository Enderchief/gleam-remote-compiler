import { entries } from 'streaming-tar';
import { connect, Connection } from '@planetscale/database';
import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

export class Client {
  #repo = 'https://repo.hex.pm/';
  db: Connection;
  constructor() {
    this.db = connect({
      host: import.meta.env.DATABASE_HOST,
      username: import.meta.env.DATABASE_USERNAME,
      password: import.meta.env.DATABASE_PASSWORD,
    });
  }

  async fetch_files(
    name: string,
    version: string
  ): Promise<Record<string, string>> {
    const res = await this.db.execute(
      `SELECT body from packages WHERE name = ? AND version = ?`,
      [name, version]
    );
    if (res.rows.length) {
      // @ts-ignore: ok
      const parsed = JSON.parse(res.rows[0].body);
      return parsed as Record<string, string>;
    }

    const path = `tarballs/${name}-${version}.tar`;

    const rawData = await fetch(`${this.#repo}${path}`);

    if (!rawData.ok) throw Error(rawData.status.toString());

    const structure: Record<string, string> = {};

    for await (const entry of entries(rawData.body!)) {
      if (entry.name === 'contents.tar.gz') {
        const tarball = entry.body;
        const stream = tarball.pipeThrough(new DecompressionStream('gzip'));
        for await (const e of entries(stream)) {
          structure[e.name] = await e.text();
        }
      } else {
        await entry.skip();
      }
    }

    const out = Object.fromEntries(
      Object.entries(structure).map(([k, v]) => [
        `/build/packages/${name}/${k}`,
        v,
      ])
    );

    await this.db.execute(
      `INSERT INTO packages (name, version, body) VALUES (?, ?, ?)`,
      [name, version, JSON.stringify(out)]
    );

    return out;
  }
}

const client = new Client();

const schema = z.record(z.string());

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('Content-Type');
  if (contentType !== 'application/json')
    return json({
      error: `invalid content type "${contentType}", expecting "application/json"`,
    });

  try {
    const rawData = await request.json();
    const data = schema.safeParse(rawData);
    if (!data.success)
      return json({ error: data.error.toString(), type: 'validation' });

    const _temp = await Promise.all(
      Object.entries(data.data).map(async ([name, version]) => {
        let _temp = await client.fetch_files(name, version);
        return _temp;
      })
    );
    const dependencies = Object.assign({}, ..._temp);
    return json(dependencies);
  } catch (e) {
    return json({ error: `${e}`, type: 'api' });
  }

  //   return json({ error: 'this code should not be here', type: 'server' });
};

function json(o: any, init?: ResponseInit) {
  return new Response(JSON.stringify(o), {
    headers: { 'content-type': 'application/json' },
    status: init?.status!,
  });
}
