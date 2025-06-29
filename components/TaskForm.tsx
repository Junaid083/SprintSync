"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Calendar, User } from "lucide-react"
import { taskService } from "@/lib/services/task"
import { userService } from "@/lib/services/user"
import { authService } from "@/lib/services/auth"
import { aiService } from "@/lib/services/ai"
import { useToast } from "@/hooks/use-toast"
import type { User as UserType } from "@/lib/types"

interface TaskFormProps {
  taskId?: string
}

export function TaskForm({ taskId }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("todo")
  const [priority, setPriority] = useState("medium")
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [dueDate, setDueDate] = useState("")
  const [assignedUserId, setAssignedUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userData = await authService.me()
        setCurrentUser(userData)
        setAssignedUserId(userData._id) // Default to current user

        if (userData.isAdmin) {
          const usersData = await userService.getList()
          setUsers(usersData)
        }

        if (taskId) {
          await fetchTask()
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load initial data",
          variant: "destructive",
        })
      }
    }

    fetchInitialData()
  }, [taskId])

  const fetchTask = async () => {
    if (!taskId) return

    try {
      const task = await taskService.getById(taskId)
      setTitle(task.title)
      setDescription(task.description)
      setStatus(task.status)
      setPriority(task.priority)
      setTotalMinutes(task.totalMinutes)
      if (task.dueDate) {
        setDueDate(new Date(task.dueDate).toISOString().split("T")[0])
      }
      // Handle both string and populated user object
      const userId = typeof task.userId === "string" ? task.userId : task.userId._id
      setAssignedUserId(userId)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch task",
        variant: "destructive",
      })
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!title.trim()) {
      newErrors.title = "Task title is required"
    } else if (title.length > 200) {
      newErrors.title = "Task title cannot exceed 200 characters"
    }

    if (!description.trim()) {
      newErrors.description = "Task description is required"
    } else if (description.length > 2000) {
      newErrors.description = "Task description cannot exceed 2000 characters"
    }

    if (totalMinutes < 0) {
      newErrors.totalMinutes = "Time cannot be negative"
    }

    if (dueDate && new Date(dueDate) <= new Date()) {
      newErrors.dueDate = "Due date must be in the future"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        totalMinutes,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        assignedUserId: currentUser?.isAdmin ? assignedUserId : undefined,
      }

      if (taskId) {
        await taskService.update(taskId, taskData)
        toast({
          title: "Success",
          description: "Task updated successfully",
        })
      } else {
        await taskService.create(taskData)
        toast({
          title: "Success",
          description: "Task created successfully",
        })
      }

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAiSuggest = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title first",
        variant: "destructive",
      })
      return
    }

    setIsAiLoading(true)
    try {
      const suggestion = await aiService.suggest(title)
      setDescription(suggestion.description || suggestion.suggestion || "")
      toast({
        title: "Success",
        description: "AI suggestion applied",
      })
    } catch (error: any) {
      toast({
        title: "AI Suggestion Error",
        description: error.message || "Failed to get AI suggestion",
        variant: "destructive",
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  const getCharacterCount = (text: string, max: number) => {
    const remaining = max - text.length
    const color = remaining < 50 ? "text-red-500" : remaining < 100 ? "text-yellow-500" : "text-gray-500"
    return <span className={`text-xs ${color}`}>{remaining} characters remaining</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{taskId ? "Edit Task" : "Create New Task"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
              maxLength={200}
              className={errors.title ? "border-red-500" : ""}
            />
            <div className="flex justify-between">
              {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
              {getCharacterCount(title, 200)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAiSuggest}
                disabled={isAiLoading || !title.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isAiLoading ? "Generating..." : "AI Suggest"}
              </Button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={6}
              required
              maxLength={2000}
              className={errors.description ? "border-red-500" : ""}
            />
            <div className="flex justify-between">
              {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
              {getCharacterCount(description, 2000)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                      High
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalMinutes">Time (minutes)</Label>
              <Input
                id="totalMinutes"
                type="number"
                value={totalMinutes}
                onChange={(e) => setTotalMinutes(Number.parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className={errors.totalMinutes ? "border-red-500" : ""}
              />
              {errors.totalMinutes && <span className="text-xs text-red-500">{errors.totalMinutes}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <div className="relative">
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={errors.dueDate ? "border-red-500" : ""}
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.dueDate && <span className="text-xs text-red-500">{errors.dueDate}</span>}
            </div>

            {currentUser?.isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="assignedUser">Assign To</Label>
                <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {user.email}
                          {user.isAdmin && <span className="ml-2 text-xs text-blue-600">(Admin)</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : taskId ? "Update Task" : "Create Task"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
