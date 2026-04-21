import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFee(amount: number): string {
  if (amount === 0) return 'Free'
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount}`
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    applied:              'bg-blue-100 text-blue-800',
    approved:             'bg-emerald-100 text-emerald-800',
    interview_scheduled:  'bg-purple-100 text-purple-800',
    admitted:             'bg-green-100 text-green-800',
    rejected:             'bg-rose-100 text-rose-800',
    withdrawn:            'bg-slate-100 text-slate-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
