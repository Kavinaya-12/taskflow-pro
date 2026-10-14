const asyncHandler = require('express-async-handler')
const Task = require('../models/Task')
const mongoose = require('mongoose')

const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const normalizeDueDate = (res, value) => {
  if (value === undefined) return undefined // leave untouched on partial updates
  if (value === null || value === '') return null
  if (typeof value !== 'string' || !DUE_DATE_PATTERN.test(value.trim())) {
    res.status(400)
    throw new Error('dueDate must be a calendar date in YYYY-MM-DD format')
  }
  const [year, month, day] = value.trim().split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  const isRealDate = parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
  if (!isRealDate) {
    res.status(400)
    throw new Error('dueDate must be a valid calendar date in YYYY-MM-DD format')
  }
  return value.trim()
}

const createTask = asyncHandler(async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
  const { description, priority, category } = req.body
  const dueDate = normalizeDueDate(res, 'dueDate' in req.body ? req.body.dueDate : undefined)

  if (!title || title.length > 200 || (description && description.length > 2000) || (category && category.length > 100)) {
    res.status(400)
    throw new Error('Title is required (200 characters max); description and category are limited to 2000 and 100 characters')
  }

  const task = await Task.create({
    title,
    description,
    priority,
    category,
    dueDate: dueDate === undefined ? null : dueDate,
    user: req.user._id,
  })

  res.status(201).json(task)
})

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.status(200).json(tasks)
})

const updateTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400)
    throw new Error('Invalid task id')
  }
  const task = await Task.findById(req.params.id)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error('Not authorized')
  }

  const allowedFields = ['title', 'description', 'status', 'priority', 'category', 'dueDate']
  const updates = Object.fromEntries(
    allowedFields
      .filter((field) => Object.hasOwn(req.body, field))
      .map((field) => [field, req.body[field]])
  )
  if (typeof updates.title === 'string') updates.title = updates.title.trim()
  if (Object.hasOwn(updates, 'dueDate')) updates.dueDate = normalizeDueDate(res, updates.dueDate)
  if (updates.title === '' || (updates.title && updates.title.length > 200) || (updates.description && updates.description.length > 2000) || (updates.category && updates.category.length > 100)) {
    res.status(400)
    throw new Error('Task fields exceed their allowed lengths')
  }
  if (!Object.keys(updates).length) {
    res.status(400)
    throw new Error('No valid task fields provided')
  }
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })

  res.status(200).json(updatedTask)
})

const deleteTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400)
    throw new Error('Invalid task id')
  }
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
