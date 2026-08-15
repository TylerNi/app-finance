'use client'

type Option = { value: string; label: string }

type SegmentedControlProps = {
  options: Option[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="flex h-11 gap-1 rounded-control bg-border">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-control text-sm ${
            option.value === value ? 'bg-surface text-text' : 'text-muted'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
