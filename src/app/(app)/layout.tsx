import { TabBar } from '@/components/ui/tab-bar'
import { getCurrentProfile, getProfiles } from '@/lib/profiles'

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const [profiles, profile] = await Promise.all([getProfiles(), getCurrentProfile()])

  return (
    <>
      {children}
      <TabBar profiles={profiles} currentProfileId={profile.id} />
    </>
  )
}
