import axios from 'axios'

const API_URL = 'http://localhost:5000/api/tasks'

// GET TASKS
const getTasks = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL, config)

  return response.data
}

// CREATE TASK
const createTask = async (taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post(API_URL, taskData, config)

  return response.data
}

// DELETE TASK
const deleteTask = async (taskId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.delete(`${API_URL}/${taskId}`, config)

  return response.data
}

// UPDATE TASK
const updateTask = async (taskId, taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.put(`${API_URL}/${taskId}`, taskData, config)

  return response.data
}

const taskService = {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
}

export default taskService
