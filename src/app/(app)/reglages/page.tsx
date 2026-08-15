import { Button } from '@/components/ui/button'
import { signOut } from '@/app/login/actions'

export default function Reglages() {
  return (
    <main className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Réglages</h1>
      <form action={signOut}>
        <Button type="submit" variant="danger">
          Se déconnecter
        </Button>
      </form>
    </main>
  )
}
