import api from './api'

const getTasks = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await api.get('/tasks', config)

  return response.data
}

const createTask = async (taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await api.post('/tasks', taskData, config)

  return response.data
}

const deleteTask = async (taskId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await api.delete(`/tasks/${taskId}`, config)

  return response.data
}

const updateTask = async (taskId, taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await api.put(`/tasks/${taskId}`, taskData, config)

  return response.data
}

const taskService = {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
}

export default taskService
