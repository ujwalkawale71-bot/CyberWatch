// Severity color configurations mapped to Tailwind utility classes
// Storing full class strings ensures Tailwind compiles and bundles them correctly.
export const SEVERITY_COLORS = {
  CRITICAL: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20',
    solid: 'bg-red-500',
  },
  HIGH: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    border: 'border-orange-500/20',
    solid: 'bg-orange-500',
  },
  MEDIUM: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
    solid: 'bg-amber-500',
  },
  LOW: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-500',
    border: 'border-indigo-500/20',
    solid: 'bg-indigo-500',
  },
  SAFE: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    solid: 'bg-emerald-500',
  },
} as const
