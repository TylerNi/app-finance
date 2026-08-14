export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (!process.env.DATABASE_URL) return

  const { runMigrations } = await import('./lib/migrate')
  await runMigrations()
}
