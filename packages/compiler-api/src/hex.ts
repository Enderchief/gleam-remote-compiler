import { entries } from 'streaming-tar';
import { connect, Connection } from '@planetscale/database';

export class Client {
  #repo = 'https://repo.hex.pm/';
  db: Connection;
  constructor() {
    this.db = connect({
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
    });
  }

  async fetch_files(
    name: string,
    version: string
  ): Promise<Record<string, string> | string> {
    const res = await this.db.execute(
      `SELECT body from packages WHERE name = ? AND version = ?`,
      [name, version]
    );
    if (res.rows.length) {
      // @ts-ignore: ok
      return JSON.parse(res.rows[0].body) as Record<string, string>;
    }

    const path = `tarballs/${name}-${version}.tar`;

    const rawData = await fetch(`${this.#repo}${path}`);

    if (!rawData.ok) return rawData.status.toString();

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
