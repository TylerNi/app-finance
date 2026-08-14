import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pool } from './db'

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations')

export async function runMigrations(): Promise<void> {
  const client = await pool.connect()

  try {
    await client.query('select pg_advisory_lock(3721)')
    await client.query(
      `create table if not exists schema_migrations (
         name text primary key,
         applied_at timestamptz not null default now()
       )`
    )

    const { rows } = await client.query<{ name: string }>('select name from schema_migrations')
    const applied = new Set(rows.map((row) => row.name))

    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()

    for (const file of files) {
      if (applied.has(file)) continue

      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8')
      await client.query('begin')
      try {
        await client.query(sql)
        await client.query('insert into schema_migrations (name) values ($1)', [file])
        await client.query('commit')
      } catch (error) {
        await client.query('rollback')
        throw error
      }
      console.log(`[migrate] ${file}`)
    }
  } finally {
    await client.query('select pg_advisory_unlock(3721)')
    client.release()
  }
}
