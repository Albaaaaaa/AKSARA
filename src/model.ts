import type { Item, Page, Role } from './App'

export const OPERATOR_UNIT = 'Fungsi Diseminasi'

export function mayEdit(role: Role, page: Page, item?: Item): boolean {
  if (page === 'audit' || item?.status === 'Dikunci') return false
  if (role === 'Admin') return true
  if (role !== 'Operator' || !['capaian', 'dokumen', 'bukti', 'permintaan'].includes(page)) return false
  if (!item) return page !== 'permintaan'
  if (page === 'permintaan') return item.unit === OPERATOR_UNIT && ['Belum tersedia','Dalam proses'].includes(item.status)
  return item.unit === OPERATOR_UNIT && ['Draft', 'Perlu perbaikan'].includes(item.status)
}

export function recordsForRole(records: Record<string, Item[]>, role: Role) {
  return Object.fromEntries(Object.entries(records).map(([page, rows]) => [page,
    role !== 'Admin' && ['pengguna', 'unit', 'audit'].includes(page) ? [] :
    role === 'Operator' && ['capaian', 'iku', 'bukti', 'permintaan'].includes(page)
      ? rows.filter(row => row.unit === OPERATOR_UNIT) : rows,
  ]))
}

export function allowedTransition(role: Role, page: Page, item: Item, next: string) {
  if (page === 'audit' || item.status === 'Dikunci') return false
  if (next === 'Menunggu validasi') return page === 'capaian' && mayEdit(role, page, item) && ['Draft', 'Perlu perbaikan'].includes(item.status)
  if (next === 'Disetujui' || (next === 'Perlu perbaikan' && page === 'capaian')) return ['Admin', 'Validator'].includes(role) && item.status === 'Menunggu validasi'
  if (next === 'Dikunci') return role === 'Admin' && item.status === 'Disetujui'
  if (role === 'Admin') return true
  if (role === 'Operator' && page === 'permintaan') return item.unit === OPERATOR_UNIT && ['Dalam proses','Tersedia'].includes(next)
  return role === 'Validator' && page === 'bukti' && ['Menunggu verifikasi', 'Terverifikasi', 'Perlu perbaikan'].includes(next)
}

export function achievementPercent(target: string, actual: string): number | null {
  const parse = (value: string) => Number(value.replace('%', '').replace(',', '.'))
  if (!target.trim() || !actual.trim()) return null
  const denominator = parse(target), numerator = parse(actual)
  return Number.isFinite(denominator) && denominator > 0 && Number.isFinite(numerator) ? numerator / denominator * 100 : null
}
