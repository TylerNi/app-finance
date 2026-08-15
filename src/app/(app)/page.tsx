import { query } from '@/lib/db'

export default async function Home() {
  const [row] = await query<{ now: Date }>('select now()')

  return (
    <main className="flex min-h-screen items-center justify-center p-8 font-sans">
      <p>{row.now.toISOString()}</p>
    </main>
  )
}
