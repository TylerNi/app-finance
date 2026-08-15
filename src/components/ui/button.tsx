import type { ComponentProps } from 'react'

const variants = {
  primary: 'bg-accent text-white',
  ghost: 'bg-surface text-accent border border-border',
  danger: 'bg-danger text-white',
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variants
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`h-12 w-full rounded-control text-base font-medium transition-opacity active:opacity-70 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
