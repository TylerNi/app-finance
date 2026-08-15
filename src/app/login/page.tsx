import { getProfiles } from '@/lib/profiles'
import { LoginForm } from './login-form'

export default async function Login() {
  const profiles = await getProfiles()

  return (
    <main className="flex min-h-screen flex-col justify-center gap-8 p-6">
      <h1 className="text-center text-2xl font-semibold">Finances</h1>
      <LoginForm profiles={profiles} />
    </main>
  )
}
