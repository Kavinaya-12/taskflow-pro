const asyncHandler = require('express-async-handler')
const Task = require('../models/Task')

// CREATE TASK
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, category } = req.body

  if (!title) {
    res.status(400)
    throw new Error('Title is required')
  }

  const task = await Task.create({
    title,
    description,
    priority,
    category,
    user: req.user._id,
  })

  res.status(201).json(task)
})

// GET USER TASKS
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.status(200).json(tasks)
})

// UPDATE TASK
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error('Not authorized')
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })

  res.status(200).json(updatedTask)
})

// DELETE TASK
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error('Not authorized')
  }

  await task.deleteOne()

  res.status(200).json({ message: 'Task deleted' })
})

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
}
