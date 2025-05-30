import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Home from "@/components/dashboard/home"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  )
}
