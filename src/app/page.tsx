import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { error } = await supabase.auth.getUser()
  const echec = error && error.name !== 'AuthSessionMissingError'

  return (
    <main className="flex min-h-screen items-center justify-center p-8 font-sans">
      <p>{echec ? `erreur : ${error.message}` : 'connecté à Supabase'}</p>
    </main>
  )
}
