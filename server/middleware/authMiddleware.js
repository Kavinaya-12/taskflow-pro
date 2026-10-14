const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    let decoded
    try {
      token = req.headers.authorization.split(' ')[1]
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      res.status(401)
      throw new Error('Not authorized')
    }

    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user || (decoded.tokenVersion || 0) !== (req.user.tokenVersion || 0)) {
      res.status(401)
      throw new Error('Not authorized')
    }

    return next()
  }

  res.status(401)
  throw new Error('No token found')
})

module.exports = { protect }
