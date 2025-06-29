import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { TaskForm } from "@/components/TaskForm"

interface EditTaskPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    redirect("/auth/login")
  }

  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
            <p className="mt-2 text-gray-600">Update your task details</p>
          </div>
          <TaskForm taskId={id} />
        </div>
      </main>
    </div>
  )
}
