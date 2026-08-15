'use client'

type AmountFieldProps = {
  value: number
  onChange: (cents: number) => void
}

export function AmountField({ value, onChange }: AmountFieldProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-[40px]">
      <input
        inputMode="numeric"
        autoFocus
        value={(value / 100).toFixed(2).replace('.', ',')}
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, '').slice(-9)))}
        className="w-full bg-transparent text-right text-[40px] tabular-nums outline-none"
      />
      <span className="text-muted">$</span>
    </div>
  )
}
