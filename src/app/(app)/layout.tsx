import { TabBar } from '@/components/ui/tab-bar'

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      {children}
      <TabBar />
    </>
  )
}
