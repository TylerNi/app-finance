import Link from 'next/link'

type BackLinkProps = {
  href: string
  className?: string
}

export function BackLink({ href, className = '' }: BackLinkProps) {
  return (
    <Link
      href={href}
      aria-label="Retour"
      className={`px-2 text-2xl text-accent active:opacity-70 ${className}`}
    >
      ‹
    </Link>
  )
}
