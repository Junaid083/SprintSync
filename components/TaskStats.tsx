"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle, Circle, PlayCircle, Users } from "lucide-react"
import { taskService } from "@/lib/services/task"
import { authService } from "@/lib/services/auth"
import type { Task, User } from "@/lib/types"

export function TaskStats() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await authService.me()
        setCurrentUser(userData)

        // Fetch all tasks for stats (without pagination)
        const data = await taskService.getList({ limit: 1000 })
        setTasks(data.tasks)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalTasks = tasks.length
  const todoTasks = tasks.filter((task) => task.status === "todo").length
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length
  const doneTasks = tasks.filter((task) => task.status === "done").length
  const totalMinutes = tasks.reduce((sum, task) => sum + task.totalMinutes, 0)

  // Get unique users count for admin
  const uniqueUsers = currentUser?.isAdmin
    ? new Set(tasks.map((task) => (typeof task.userId === "string" ? task.userId : task.userId._id))).size
    : 0

  const stats = [
    {
      title: "Total Time",
      value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "To Do",
      value: todoTasks,
      icon: Circle,
      color: "text-gray-600",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: PlayCircle,
      color: "text-yellow-600",
    },
    {
      title: "Completed",
      value: doneTasks,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  // Add users stat for admin
  if (currentUser?.isAdmin) {
    stats.push({
      title: "Active Users",
      value: uniqueUsers,
      icon: Users,
      color: "text-purple-600",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
