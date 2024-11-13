'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2 } from 'lucide-react'

// Simulated API functions
const api = {
  getTasks: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    return JSON.parse(localStorage.getItem('tasks') || '[]')
  },
  addTask: async (task) => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    tasks.push(task)
    localStorage.setItem('tasks', JSON.stringify(tasks))
    return task
  },
  deleteTask: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    const updatedTasks = tasks.filter(task => task.id !== id)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }
}

// Simulated AI function for task categorization and prioritization
const aiCategorizeAndPrioritize = async (taskDescription) => {
  await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate AI processing time
  const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance']
  const priorities = ['Low', 'Medium', 'High', 'Urgent']
  
  // Simple "AI" logic based on keywords
  const category = categories[Math.floor(Math.random() * categories.length)]
  let priority = priorities[Math.floor(Math.random() * priorities.length)]
  
  if (taskDescription.toLowerCase().includes('urgent') || taskDescription.toLowerCase().includes('important')) {
    priority = 'Urgent'
  } else if (taskDescription.toLowerCase().includes('soon') || taskDescription.toLowerCase().includes('tomorrow')) {
    priority = 'High'
  }
  
  return { category, priority }
}

export function AiTaskManager() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    const fetchedTasks = await api.getTasks()
    setTasks(fetchedTasks)
    setIsLoading(false)
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    setIsLoading(true)
    const { category, priority } = await aiCategorizeAndPrioritize(newTask)
    const task = {
      id: Date.now(),
      description: newTask,
      category,
      priority,
      createdAt: new Date().toISOString()
    }
    await api.addTask(task)
    setNewTask('')
    await fetchTasks()
  }

  const handleDeleteTask = async (id) => {
    setIsLoading(true)
    await api.deleteTask(id)
    await fetchTasks()
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.category.toLowerCase() === filter.toLowerCase()
  })

  return (
    <div className="min-h-screen w-full bg-grid-animation p-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="backdrop-blur-sm bg-white/80 shadow-xl">
          <CardHeader>
            <CardTitle>AI Task Manager</CardTitle>
            <CardDescription>Let AI help you organize your tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTask} className="flex space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add
              </Button>
            </form>
            <Select onValueChange={setFilter} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredTasks.map(task => (
                  <li key={task.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{task.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Category: {task.category} | Priority: {task.priority}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Total tasks: {filteredTasks.length}
            </p>
          </CardFooter>
        </Card>
      </div>
      <style jsx global>{`
        @keyframes gridAnimation {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }
        .bg-grid-animation {
          background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridAnimation 4s linear infinite;
        }
      `}</style>
    </div>
  )
}