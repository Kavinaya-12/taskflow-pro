const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Task = require('../models/Task')
const generateToken = require('../utils/generateToken')

const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : ''
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const emailQuery = (email) => ({ $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' })

const registerUser = asyncHandler(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = normalizeEmail(req.body.email)
  const { password } = req.body
  if (!name || name.length > 100 || !validEmail(email) || email.length > 254 || typeof password !== 'string' || password.length < 6 || Buffer.byteLength(password, 'utf8') > 72) {
    res.status(400)
    throw new Error('Provide a name (100 characters max), valid email, and password of 6 to 72 UTF-8 bytes')
  }
  if (await User.findOne({ email: emailQuery(email) })) {
    res.status(409)
    throw new Error('User already exists')
  }
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) })
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id, user.tokenVersion) })
})

const loginUser = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const { password } = req.body
  const user = validEmail(email) && email.length <= 254 && typeof password === 'string' && Buffer.byteLength(password, 'utf8') <= 72 ? await User.findOne({ email: emailQuery(email) }) : null
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }
  res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id, user.tokenVersion) })
})

const getMe = asyncHandler(async (req, res) => res.status(200).json({
  _id: req.user._id,
  name: req.user.name,
  email: req.user.email,
  createdAt: req.user.createdAt,
  updatedAt: req.user.updatedAt,
}))

const deleteAccount = asyncHandler(async (req, res) => {
  const session = await User.db.startSession()
  try {
    await session.withTransaction(async () => {
      await Task.deleteMany({ user: req.user._id }, { session })
      await User.findByIdAndDelete(req.user._id, { session })
    })
    res.status(200).json({ message: 'Account deleted successfully' })
  } finally {
    await session.endSession()
  }
})

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (typeof currentPassword !== 'string' || Buffer.byteLength(currentPassword, 'utf8') > 72 || typeof newPassword !== 'string' || newPassword.length < 6 || Buffer.byteLength(newPassword, 'utf8') > 72) {
    res.status(400)
    throw new Error('Provide the current password and a new password of 6 to 72 UTF-8 bytes')
  }
  const user = await User.findById(req.user._id)
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    res.status(400)
    throw new Error('Current password is incorrect')
  }
  user.password = await bcrypt.hash(newPassword, 10)
  user.tokenVersion = (user.tokenVersion || 0) + 1
  await user.save()
  res.status(200).json({ message: 'Password updated successfully', token: generateToken(user._id, user.tokenVersion) })
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { tokenVersion: (req.user.tokenVersion || 0) + 1 })
  res.status(200).json({ message: 'Logged out successfully' })
})

const updateProfile = asyncHandler(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = normalizeEmail(req.body.email)
  if (!name || name.length > 100 || !validEmail(email) || email.length > 254) {
    res.status(400)
    throw new Error('Provide a valid name and email')
  }
  const duplicate = await User.findOne({ email: emailQuery(email), _id: { $ne: req.user._id } })
  if (duplicate) {
    res.status(409)
    throw new Error('Email is already in use')
  }
  const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true }).select('-password -tokenVersion')
  res.status(200).json(user)
})

module.exports = { registerUser, loginUser, getMe, deleteAccount, updatePassword, logoutUser, updateProfile }
