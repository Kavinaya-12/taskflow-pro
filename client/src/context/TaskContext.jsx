import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import taskService from '../services/taskService'
import { useAuth } from './useAuth'
import TaskContext from './TaskContextStore'
import { toast } from 'react-toastify'

export const TaskProvider = ({ children }) => {
  const { user } = useAuth()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const token = user?.token
  const userId = user?._id

  const completionListeners = useRef(new Set())
  const onTaskCompleted = useCallback((listener) => {
    completionListeners.current.add(listener)
    return () => completionListeners.current.delete(listener)
  }, [])
  const emitTaskCompleted = useCallback((task) => {
    completionListeners.current.forEach((listener) => {
      try {
        listener(task)
      } catch (error) {
        void error
      }
    })
  }, [])

  useEffect(() => {
    let active = true
    const fetchTasks = async () => {
      setTasks([])
      setError(null)
      if (!token) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await taskService.getTasks(token)
        if (active) setTasks(Array.isArray(data) ? data : [])
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load tasks')
          toast.error(err.response?.data?.message || 'Failed to load tasks')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchTasks()
    return () => { active = false }
  }, [token, userId])

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const updated = await taskService.updateTask(taskId, taskData, token)
      setTasks((prev) => prev.map((task) => task._id === taskId ? updated : task))
      toast.success('Task updated')
      return updated
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
      throw err
    }
  }, [token])

  const createTask = useCallback(async (taskData) => {
    try {
      const data = await taskService.createTask(taskData, token)
      setTasks((prev) => [data, ...prev])
      toast.success('Task created successfully')
      return data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
      throw err
    }
  }, [token])

  const deleteTask = useCallback(async (taskId) => {
    try {
      await taskService.deleteTask(taskId, token)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
      toast.success('Task deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }, [token])

  const toggleStatus = useCallback(async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed'
    try {
      const updated = await taskService.updateTask(task._id, { status: nextStatus }, token)
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)))
      if (nextStatus === 'Completed') emitTaskCompleted(updated)
      else toast.success('Task moved back to your list')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }, [token, emitTaskCompleted])

  const value = useMemo(
    () => ({ tasks, loading, error, createTask, updateTask, deleteTask, toggleStatus, onTaskCompleted }),
    [tasks, loading, error, createTask, updateTask, deleteTask, toggleStatus, onTaskCompleted]
  )

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}
