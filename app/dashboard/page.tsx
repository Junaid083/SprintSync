import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { TaskList } from "@/components/TaskList"
import { TaskStats } from "@/components/TaskStats"
import { Navbar } from "@/components/Navbar"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your tasks and track your progress</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <TaskStats />
            </div>
            <div className="lg:col-span-3">
              <TaskList />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
