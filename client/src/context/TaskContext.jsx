import { createContext, useContext, useEffect, useState } from 'react'
import taskService from '../services/taskService'
import { useAuth } from './AuthContext'
import { toast } from 'react-toastify'

const TaskContext = createContext()

export const TaskProvider = ({ children }) => {
  const { user } = useAuth()

  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return

      try {
        const data = await taskService.getTasks(user.token)
        setTasks(data)
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load tasks')
      }
    }

    fetchTasks()
  }, [user])

  const createTask = async (taskData) => {
    try {
      const data = await taskService.createTask(taskData, user.token)
      setTasks((prev) => [data, ...prev])
      toast.success('Task created successfully')
      return data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
      throw error
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId, user.token)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
      toast.success('Task deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  const toggleStatus = async (task) => {
    try {
      const updated = await taskService.updateTask(
        task._id,
        { status: task.status === 'Completed' ? 'Pending' : 'Completed' },
        user.token
      )

      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)))
      toast.success('Task updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <TaskContext.Provider value={{ tasks, createTask, deleteTask, toggleStatus }}>
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = () => useContext(TaskContext)
