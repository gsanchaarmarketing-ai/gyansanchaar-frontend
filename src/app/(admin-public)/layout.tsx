// Admin-public layout — explicitly NO auth check
// This ensures /admin/login renders without the protected (admin) layout's auth gate
export default function AdminPublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
